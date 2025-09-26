package main

import (
	"log"
	"os"
	"fmt"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	token := os.Getenv("BOT_TOKEN")
	log.Println("\tTOKEN:", token)
	
	bot, err := tgbotapi.NewBotAPI(token)
	if err != nil {
		log.Panic(err)
	}

	bot.Debug = true

	log.Printf("\tINFO: Authorized on account %s", bot.Self.UserName)

	u := tgbotapi.NewUpdate(0) // we taking all updates from start(from 0 second)
	u.Timeout = 60 // we creating connection every 60 sec

	updates := bot.GetUpdatesChan(u) // new updates puts into updates 
	fmt.Printf("%T\n", updates) // type tgbotapi.UpdatesChannel

	// update is struct with Message, CallbackQuery, InllineQuery
	for update := range updates {
		if update.Message == nil { // ignore any non-Message updates
			continue
		}

		if !update.Message.IsCommand() { // ignore any non-command Messages
			continue
		}

		// Create a new MessageConfig. We don't have text yet,
		// so we leave it empty.
		msg := tgbotapi.NewMessage(update.Message.Chat.ID, "sad")

		// Extract the command from the Message.
		switch update.Message.Command() {
		case "help":
			msg.Text = "I understand /sayhi and /status."
		case "sayhi":
			msg.Text = "Hi :)"
		case "status":
			msg.Text = "I'm ok."
		default:
			msg.Text = "I don't know that command"
		}

		if _, err := bot.Send(msg); err != nil {
			log.Panic(err)
		}
	}
}
