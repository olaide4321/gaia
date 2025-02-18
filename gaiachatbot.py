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
    "Explain the complete mathematical foundation of blockchain consensus algorithms, including proof-of-work, proof-of-stake, and hybrid models.",
    "Develop a detailed framework for scaling blockchain networks without compromising security, including sharding and layer 2 solutions.",
    "Describe in extreme detail the cryptographic techniques used in the creation and verification of digital signatures in blockchain systems.",
    "Formulate a comprehensive analysis of the security implications of quantum computing on current blockchain protocols, and propose quantum-resistant solutions.",
    "Explain the complete process of creating a decentralized autonomous organization (DAO), including governance structures, decision-making models, and potential vulnerabilities.",
    "Develop a mathematical model for predicting the price fluctuations of cryptocurrencies using machine learning and blockchain data.",
    "Describe the complete process of implementing zk-SNARKs for private transactions in blockchain networks, including cryptographic primitives and computational complexities.",
    "Explain the full technical process of creating a decentralized finance (DeFi) protocol, including smart contract development, liquidity pooling, and risk management.",
    "Formulate a comprehensive strategy for ensuring the privacy and anonymity of users on public blockchain networks, including zero-knowledge proofs and advanced encryption methods.",
    "Develop a framework for the legal and regulatory implications of cryptocurrencies, including cross-border taxation issues and anti-money laundering protocols.",
    "Describe in meticulous detail the process of implementing atomic swaps between different blockchain networks and the cryptographic protocols involved.",
    "Develop a comprehensive analysis of the environmental impact of proof-of-work consensus mechanisms and propose sustainable alternatives.",
    "Formulate a detailed mathematical model of the incentive structures in blockchain mining pools, considering factors like rewards, network difficulty, and miner competition.",
    "Describe the full process of creating a non-fungible token (NFT) ecosystem, including smart contract development, minting, and secondary market dynamics.",
    "Explain the technical underpinnings of Ethereum's transition from proof-of-work to proof-of-stake, including network security considerations and scalability improvements.",
    "Develop a comprehensive framework for integrating cross-chain interoperability, focusing on decentralized bridges and communication protocols.",
    "Formulate a solution to the problem of transaction malleability in Bitcoin and other blockchain systems, including potential fixes and their trade-offs.",
    "Explain the economic implications of staking mechanisms in proof-of-stake blockchains, including validator incentives and network security.",
    "Describe the complete process of developing a Layer 2 scaling solution for Ethereum, such as Optimistic Rollups or zk-Rollups, including technical details and challenges.",
    "Develop a framework for decentralized identity management on the blockchain, including authentication methods, privacy considerations, and user control over data.",
    "Formulate a detailed solution for mitigating front-running attacks in decentralized exchanges (DEX), including algorithmic changes and smart contract enhancements.",
    "Describe the process of implementing and auditing smart contracts, focusing on security vulnerabilities such as reentrancy attacks, integer overflow, and access control flaws.",
    "Explain the role of oracles in blockchain-based smart contracts, including types of oracles, data sources, and potential attack vectors.",
    "Develop a mathematical framework for the tokenomics of a new cryptocurrency, including emission schedules, inflation control, and long-term sustainability.",
    "Describe the technical process of implementing decentralized storage solutions like IPFS or Filecoin, including security, redundancy, and scalability concerns.",
    "Formulate a detailed proposal for creating a decentralized prediction market, including smart contract architecture, liquidity pools, and incentive mechanisms.",
    "Explain the entire process of creating a privacy-focused blockchain, including the integration of privacy-enhancing technologies like ring signatures and stealth addresses.",
    "Develop a comprehensive analysis of the risks and benefits of stablecoins, including algorithmic vs. collateralized models and their role in the global financial system.",
    "Formulate a solution for minimizing network congestion and transaction fees on high-traffic blockchain networks, including layer 2 and off-chain solutions.",
    "Explain the implications of the Ethereum 2.0 upgrade on existing decentralized applications (dApps) and the future of Ethereum’s scalability.",
    "Develop a framework for integrating decentralized finance with traditional financial systems, including regulatory challenges and interoperability solutions.",
    "Formulate a complete mathematical model for predicting the security and decentralization of a blockchain network based on its architecture and governance model.",
    "Explain the cryptographic principles behind hash functions used in blockchain, including collision resistance, pre-image resistance, and second pre-image resistance.",
    "Develop a comprehensive strategy for preventing Sybil attacks in decentralized networks, including reputation systems and identity verification mechanisms.",
    "Describe in detail the process of creating a decentralized lending platform on the blockchain, including risk management and collateralization models.",
    "Explain the implications of blockchain forks on network security and governance, and develop strategies for resolving contentious hard forks.",
    "Formulate a complete theory of token velocity and its impact on the long-term valuation of cryptocurrencies, considering factors like staking, utility, and supply control.",
    "Develop a model for evaluating the potential security risks of decentralized applications (dApps), including smart contract auditing tools and best practices.",
    "Describe the challenges of implementing decentralized exchanges (DEX) for cross-chain trading, including liquidity management and price slippage.",
    "Explain the full process of implementing and securing a decentralized oracle network, including consensus mechanisms and fault tolerance.",
    "Develop a comprehensive proposal for scaling blockchain governance models to support billions of users, considering delegation, voting power, and network upgrades.",
    "Formulate a detailed plan for creating a privacy-preserving blockchain-based voting system, including cryptographic protocols and transparency considerations.",
    "Explain the complete mathematical and cryptographic process of creating a new cryptocurrency from scratch, including consensus mechanisms and tokenomics.",
    "Develop a framework for analyzing the security of smart contracts in DeFi protocols, focusing on common vulnerabilities and preventative measures.",
    "Describe in meticulous detail the process of creating a cross-chain decentralized application (dApp), including technical challenges and solutions for interoperability.",
    "Formulate a solution for reducing centralization risks in large-scale blockchain mining operations, including decentralized mining pools and fairness considerations.",
    "Explain the potential impacts of quantum computers on elliptic curve cryptography, and propose quantum-resistant cryptographic algorithms for blockchain systems.",
    "Develop a detailed analysis of the trade-offs between scalability, security, and decentralization in blockchain systems, known as the blockchain trilemma.",
    "Describe in detail the mathematical structure of a consensus algorithm in a proof-of-authority blockchain, including governance dynamics and validator roles.",
    "Explain the implications of network effects in cryptocurrency adoption, focusing on token liquidity, user growth, and ecosystem development."
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
