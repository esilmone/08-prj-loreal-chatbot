/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Helper function to add messages to the chat window
function addMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.className = sender === "user" ? "msg user" : "msg ai";
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Handle form submit */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get user input
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Show user message
  addMessage(userMessage, "user");
  userInput.value = "";

  // Prepare OpenAI API request
  const url = "https://api.openai.com/v1/chat/completions";

  // System message to keep responses on topic
  const systemMessage = {
    role: "system",
    content:
      "You are a helpful assistant for L'Oréal. Politely refuse to answer any questions that are not related to L'Oréal products, routines, recommendations, beauty-related topics, or similar.",
  };

  // Build messages array
  const messages = [systemMessage, { role: "user", content: userMessage }];

  // Show loading message
  addMessage("Thinking...", "ai");

  // Make the API request
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: messages,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Remove loading message
      const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
      if (loadingMsg && loadingMsg.textContent === "Thinking...") {
        chatWindow.removeChild(loadingMsg);
      }

      // Get and show AI response
      const aiText =
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
          ? data.choices[0].message.content
          : "Sorry, I couldn't get a response.";
      addMessage(aiText, "ai");
    })
    .catch((error) => {
      // Remove loading message
      const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
      if (loadingMsg && loadingMsg.textContent === "Thinking...") {
        chatWindow.removeChild(loadingMsg);
      }
      addMessage("Error: " + error.message, "ai");
    });
});
