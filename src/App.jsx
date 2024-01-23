import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const apiKey = process.env.API_URL;;

const systemMessage = {
  "role": "system", "content": "You act like a person. You make sure the conversation is enjoyable. Vary the sentence length to 20 words in your responses. One ingredients equals one of the following: #1, #2, #3, #4, #5, #6, #7, #8, #9, #10. You never provide more than one  ##INGREDIENTS## per conversational turn. It is critical that you never provide more than one  ##INGREDIENTS## per conversational turn. ## #1. Sugar #2. Lemon zest #3. Cream cheese  #4. Lemon juice #5. Sourcream  #6. Vanilla extract  #7. Eggs #8. Cracker crumbs #9. Unsalted butter #10. Lemon curd##"
}
  function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hi there! How can I help you?",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  let timerId = null;

  const handleSend = async (message) => {
    if(!timerId) {
      timerId = setTimeout(() => alert('Time is up. Copy this code: QWERTY2024 - close this window, and return to the survey.'), 300000);
    }
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages); 
  };

  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });


    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-4",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }
  await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",

      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <div style={{ position:"relative", height: "800px", width: "700px"  }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content=" " /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} attachButton={false} />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}
export default App
