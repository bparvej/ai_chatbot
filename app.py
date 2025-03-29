from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from openai import OpenAI
import os

app = Flask(__name__)

# Database Configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///chat_history.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# OpenAI Client Initialization
api_key = "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"
client = OpenAI(api_key=api_key) if api_key else None

# Database Model for Chat History
class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(10), nullable=False)  # "user" or "assistant"
    content = db.Column(db.Text, nullable=False)

# Create database tables
with app.app_context():
    db.create_all()

@app.route("/")
def index():
    messages = ChatMessage.query.all()
    return render_template("index.html", messages=messages)

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "").strip()
    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    # Save user message
    db.session.add(ChatMessage(role="user", content=user_message))
    db.session.commit()

    # OpenAI API Request
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": user_message}]
            )
            bot_reply = response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return jsonify({"error": "Failed to get response from OpenAI"}), 500
    else:
        return jsonify({"error": "OpenAI API key is missing"}), 500

    # Save bot response
    db.session.add(ChatMessage(role="assistant", content=bot_reply))
    db.session.commit()

    return jsonify({"reply": bot_reply})

if __name__ == "__main__":
    app.run(debug=True)
