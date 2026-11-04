# 🤠 ATX Weekend Pass

> An AI-powered weekend curator and payment app that turns group decision fatigue into a tailored 3-stop day pass across Austin with a unified PayPal checkout.

Built for the **PayPal & AI Global Hackathon**.

---

## 🌟 Live Demo & Links
* **Live App:** [https://atx-weekend-vibes.lovable.app](https://atx-weekend-vibes.lovable.app)
* **Creator Channel:** `@BuildWithModesta`https://www.youtube.com/@BuildwithModesta

---

## 💡 Inspiration
Living in Austin, there’s always so much going on—from paddleboarding on Lady Bird Lake to live music—that figuring out what to do can get overwhelming, especially when trying to coordinate with a group of friends with totally different vibes. **ATX Weekend Pass** was created to make weekend planning effortless: an AI curator that builds a personalized 3-stop itinerary in seconds and lets you bundle and pay for the whole day in one seamless step.

---

## ✨ Features
* **AI Vibe Curation:** Select a vibe (*Chill*, *Classic*, *Go All Out*) or enter a custom prompt. The AI generates a customized 3-stop day pass (Morning, Afternoon, Night) with venue perks.
* **Dynamic Pricing:** Automatically calculates the total pass amount based on the active itinerary.
* **Unified PayPal Checkout:** Integrated PayPal React SDK allows users to pay for all three stops in a single transaction.
* **Digital QR Pass:** Generates a unified digital pass with a QR code upon payment capture for easy venue entry.

---

## 🛠️ Tech Stack & Tools
* **Frontend UI:** Designed in **Figma**, built with **Lovable** & **React**
* **Deployment:** Hosted on **Lovable**
* **AI Engine:** **OpenAI API (`gpt-4o-mini`)** for structured JSON itinerary generation
* **Payments:** **`@paypal/react-paypal-js` SDK** (Orders & Capture API)

---

## 🚀 Development & Setup

### Built with Lovable
This project was developed using **Lovable** and synced directly to GitHub. 

### Local Development
If you prefer working locally, ensure you have Node.js and npm installed:

```bash
git clone <repository-url>
cd <repository-name>
npm install
npm run dev
