[![Coverage Status](https://coveralls.io/repos/github/lucasliet/llm-openai-ui/badge.svg?branch=main)](https://coveralls.io/github/lucasliet/llm-openai-ui?branch=main)

# Chat Application

A simple chat application that utilizes OpenAI's API to provide conversational responses. The application supports Markdown rendering, streaming responses, and displays the time taken for the assistant to think.

## Features

- **Markdown Rendering**: Supports rendering of Markdown content in chat messages.
- **Streaming Responses**: Displays responses from the assistant in real-time as they are generated.
- **Thinking Time Display**: Shows the time taken by the assistant to generate a response in seconds.
- **Collapsible Thought Content**: Displays additional thought content in a collapsible format.
- **Model Selection**: Allows users to select from available models for generating responses.
- **Error Handling**: Displays error messages for loading models and processing messages.

## Technologies Used

- React
- TypeScript
- Vite
- OpenAI API
- React Markdown
- CSS for styling

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chat-application.git
   cd chat-application
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173` (or the port specified in the terminal).

3. Use the input field to send messages to the assistant. You can format your messages using Markdown.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for providing the API.
- The community for various libraries and resources that made this project possible.
