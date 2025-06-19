# Voyager CraftWorld Auto Bot

This bot automatically handles daily login, quest claiming, and chest spinning for multiple wallets on the Voyager CraftWorld platform.

## 📋 Features

- **Multi-wallet support** - Process multiple wallets automatically
- **Daily quest automation** - Auto-claim ready quests
- **Chest spinning** - Auto-spin daily free chests and coin chests
- **Proxy support** - Use HTTP/HTTPS/SOCKS4/SOCKS5 proxies for each wallet
- **Daily reset countdown** - Automatically waits for next daily reset
- **Session management** - Handle authentication and sessions automatically

## 🎯 Getting Started

### 1. Register Your Account
First, create your Voyager CraftWorld account :


### 2. Join Our Community
Stay updated with the latest airdrops and updates:
🔗 **[Join Airdrop Insiders Telegram](https://t.me/Airdropoe)**

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Clone the Repository
```bash
git clone 
cd Voyager-CraftWorld-Bot
```

### Install Dependencies
```bash
npm install
```

## ⚙️ Configuration

### 1. Environment Setup
Create a `.env` file in the root directory:

```env
# Add your private keys (as many as you need)
PRIVATE_KEY_1=your_first_private_key_here
PRIVATE_KEY_2=your_second_private_key_here
PRIVATE_KEY_3=your_third_private_key_here
# Add more as needed...
```

### 2. Proxy Setup (Optional)
Create a `proxies.txt` file in the root directory if you want to use proxies:

```txt
# HTTP Proxies
http://proxy1.example.com:8080
http://username:password@proxy2.example.com:8080

# HTTPS Proxies  
https://proxy3.example.com:8080
https://username:password@proxy4.example.com:8080

# SOCKS4 Proxies
socks4://proxy5.example.com:1080

# SOCKS5 Proxies
socks5://proxy6.example.com:1080
socks5://username:password@proxy7.example.com:1080
```

**Proxy Format Examples:**
- `http://proxy.example.com:8080`
- `https://user:pass@proxy.example.com:8080`
- `socks4://proxy.example.com:1080`
- `socks5://user:pass@proxy.example.com:1080`

## 🚀 Usage

### Start the Bot
```bash
node index.js
```

### What the Bot Does
1. **Authentication** - Signs in to each wallet using SIWE (Sign-In with Ethereum)
2. **Daily Login** - Completes daily login quest
3. **Quest Claiming** - Automatically claims all ready quests
4. **Chest Spinning** - Opens available daily chests:
   - Daily Chest (Free)
   - Sturdy Chest (Coin)
5. **Daily Loop** - Waits for next daily reset and repeats

## 📁 Project Structure

```
Voyager-CraftWorld-Bot/
├── README.md
├── package.json
├── .env                    # Your private keys (create this)
├── proxies.txt            # Your proxy list (optional)
└── paste.txt              # Main bot script
```

## 🔧 Advanced Configuration

### Multiple Wallets
Add as many private keys as needed in your `.env` file:
```env
PRIVATE_KEY_1=0x...
PRIVATE_KEY_2=0x...
PRIVATE_KEY_3=0x...
PRIVATE_KEY_4=0x...
# etc...
```

## ⚠️ Important Notes

- **Private Key Security**: Never share your private keys. Keep your `.env` file secure.
- **Rate Limiting**: The bot includes delays between requests to avoid rate limiting.
- **Daily Reset**: The bot automatically waits for the next daily reset (00:00 UTC).
- **Proxy Testing**: All proxies are tested before use. Only working proxies are utilized.

## 🛡️ Security Best Practices

1. **Use Dedicated Wallets**: Create separate wallets specifically for this bot.
2. **Limited Funds**: Only keep minimal funds needed for transactions.
3. **Secure Environment**: Run the bot on a secure server or local machine.
4. **Regular Updates**: Keep the bot updated with the latest version.

## 🐛 Troubleshooting

### Common Issues

**"No private keys found"**
- Make sure your `.env` file exists and contains `PRIVATE_KEY_1=...` format

**"Proxy connection failed"**
- Verify your proxy credentials and format in `proxies.txt`
- The bot will work without proxies if none are available

**"Authentication failed"**
- Check if your private key is valid
- Ensure your wallet has some ETH for gas fees

**"Rate limit reached"**
- The bot includes automatic delays, but you can increase them if needed
- Consider using fewer wallets or longer delays

## 📈 Performance Tips

- **Optimal Wallet Count**: 3-10 wallets work best for stability
- **Proxy Quality**: Use high-quality, stable proxies for better success rates
- **Network Stability**: Ensure stable internet connection for 24/7 operation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes. Use at your own risk.

## 📞 Support


## 🎉 Credits

Developed by **Airdrop Insiders** team for the community.

---

⭐ **Don't forget to star this repository if it helped you!**

📱 **Join Telegram**: https://t.me/Airdropoe