$(document).ready(function () {
    console.log("Script.js loaded successfully");
    const chatBox = $("#chat-box");
    const userInput = $("#user-input");
    
    // Dark Mode Toggle
    function toggleDarkMode() {
        $("body").toggleClass("dark-mode");
        localStorage.setItem("darkMode", $("body").hasClass("dark-mode"));
    }

    // Load Dark Mode Preference
    if (localStorage.getItem("darkMode") === "true") {
        $("body").addClass("dark-mode");
    }

    // Handle Enter Key for Sending Messages and Shift+Enter for New Line
    userInput.on("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    // Function to Send User Message
    function sendMessage() {
        console.log('Sending message...');
        const userMessage = userInput.val().trim();
        if (userMessage !== "") {
            displayMessage(userMessage, "user");
            userInput.val("");
            sendToServer(userMessage);
        }
    }

    // Function to Display Message with Typing Effect
    function displayMessage(message, sender) {
        const messageWrapper = $("<div>").addClass("message-wrapper " + sender);
        const messageElement = $("<div>").addClass("message");
        messageWrapper.append(messageElement);
        chatBox.append(messageWrapper);
        chatBox.scrollTop(chatBox.prop("scrollHeight")); // Auto-scroll

        let index = 0;
        function typeText() {
            if (index < message.length) {
                messageElement.append(message[index]);
                index++;
                setTimeout(typeText, 20);
            }
        }
        typeText();
    }

    // Function to Send Message to the Server
    function sendToServer(userMessage) {
        $.ajax({
            url: "/chat",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ message: userMessage }),
            success: function (data) {
                if (data.reply) {
                    displayMessage(data.reply, "bot");
                }
            },
            error: function (error) {
                console.error("Error sending message:", error);
            }
        });
    }

    // Dark Mode Toggle Button
    $("#dark-mode-toggle").click(toggleDarkMode);
});
