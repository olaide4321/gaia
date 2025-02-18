import requests
import random
import time
import logging
from typing import List

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("chatbot.log"),
        logging.StreamHandler()
    ]
)

# Configuration
BASE_URL = "https://tejumola.gaia.domains"  # Updated base URL
MODEL = "qwen2-0.5b-instruct"
MAX_RETRIES = 100  # Essentially infinite retries
RETRY_DELAY = 5  # Seconds between retries
QUESTION_DELAY = 1  # Seconds between successful questions

# Add your own questions here
QUESTIONS = [
    "What is blockchain technology and how does it work?",
    "What is the difference between proof-of-work and proof-of-stake?",
    "How do cryptocurrencies like Bitcoin maintain security?",
    "What are smart contracts and how are they used in blockchain?",
    "How does a decentralized exchange (DEX) work?",
    "What is a cryptocurrency wallet and how do I use one?",
    "What is the purpose of mining in a blockchain network?",
    "What is the role of miners in Bitcoin transactions?",
    "How does Ethereum differ from Bitcoin?",
    "What is a token, and how does it differ from a coin?",
    "What is a decentralized application (dApp)?",
    "How do stablecoins maintain their value?",
    "What is a blockchain fork, and what are its implications?",
    "What is the process of buying and selling cryptocurrency?",
    "How can I store my cryptocurrencies securely?",
    "What is gas in the context of Ethereum transactions?",
    "What are non-fungible tokens (NFTs) and how do they work?",
    "How does cryptocurrency affect traditional finance?",
    "What is a cryptocurrency exchange and how does it work?",
    "What are the benefits of using cryptocurrency?",
    "What is the role of an oracle in blockchain?",
    "How do I avoid scams in the cryptocurrency space?",
    "What is the future of cryptocurrency regulation?",
    "What is a tokenomics model?",
    "How can blockchain be used for privacy protection?",
    "What are the risks of investing in cryptocurrency?",
    "How can I track cryptocurrency prices and trends?",
    "What is the Lightning Network in Bitcoin?",
    "How do cryptocurrency transactions work?",
    "What are privacy coins and how do they work?",
    "What is a Layer 2 solution for blockchain scalability?"
]


def chat_with_ai(api_key: str, question: str) -> str:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    messages = [
        {"role": "user", "content": question}
    ]

    data = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.7
    }

    for attempt in range(MAX_RETRIES):
        try:
            logging.info(f"Attempt {attempt+1} for question: {question[:50]}...")

            response = requests.post(
                f"{BASE_URL}/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=60  # Increased timeout
            )

            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]

            logging.warning(f"API Error ({response.status_code}): {response.text}")

            # Exponential backoff (retry delay increases after each failure)
            delay = RETRY_DELAY * (2 ** attempt)  # Double the delay after each retry
            logging.info(f"Retrying in {delay}s...")
            time.sleep(delay)

        except Exception as e:
            logging.error(f"Request failed: {str(e)}")
            # Exponential backoff
            delay = RETRY_DELAY * (2 ** attempt)
            logging.info(f"Retrying in {delay}s...")
            time.sleep(delay)

    raise Exception("Max retries exceeded")

def run_bot(api_key: str):
    while True:  # Outer loop to repeat the questions indefinitely
        random.shuffle(QUESTIONS)
        logging.info(f"Starting chatbot with {len(QUESTIONS)} questions in random order")

        for i, question in enumerate(QUESTIONS, 1):
            logging.info(f"\nProcessing question {i}/{len(QUESTIONS)}")
            logging.info(f"Question: {question}")

            start_time = time.time()
            try:
                response = chat_with_ai(api_key, question)
                elapsed = time.time() - start_time

                # Print the entire response
                print(f"Answer to '{question[:50]}...':\n{response}")

                logging.info(f"Received full response in {elapsed:.2f}s")
                logging.info(f"Response length: {len(response)} characters")

                # Ensure the script waits for the full response before proceeding
                time.sleep(QUESTION_DELAY)  # Wait before asking next question

            except Exception as e:
                logging.error(f"Failed to process question: {str(e)}")
                continue

def main():
    print("Title: GaiaAI Chatbot")
    print("Created by: MEFURY")
    print("Twitter: https://x.com/meefury")
    api_key = input("Enter your API key: ")
    run_bot(api_key)

if __name__ == "__main__":
    main()
