## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
4. Add your API keys:
   - Get a key from [RapidAPI Boxing Data](https://rapidapi.com/api-sports/api/boxing-data)
   - Get a key from [Groq Cloud](https://console.groq.com/)
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

- `RAPIDAPI_KEY`: Your RapidAPI key.
- `GROQ_API_KEY`: Your Groq API key.
- `GROQ_COMPOUND_MODEL`: Model name (default: `compound`).
# boxing-analyst
