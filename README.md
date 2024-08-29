# MyMails server

to start the application use
nodemon app.js
or
node app.js

NOTE: this uses Google Generative suite and Gemini API as OPENAI free trial is now been disabled and it requires to credit some amount to try using their services

Environment Variables:
You wud need to set up the following env variables to start using this application
PORT =
GEMINI_KEY =  
GMAIL_CLIENT_ID =
GMAIL_CLIENT_SECRET =  
GMAIL_REDIRECT_URI =  
GMAIL_REFRESH_TOKEN =

The commit 1 ( lets call it ver1 ) is static in terms of authentication you can get the access tokens from
https://developers.google.com/oauthplayground/
(but it is good for checking the capabilities of the api)

the api endpoints are
/api/google/list - for fetching a list of latest 10 mails
/api/google/drafts - for getting latest 10 drafts
/api/google/inbox - for getting latest 10 mails from user inbox that are UNSEEN
/api/google/read/:messageId - for getting populated details abou a particular mail by its id
/api/google/classify/:messageId - for classifying a message into [ Interested, Not Interested, More Information ] and then also generating an apt response for this mail
/api/google/send/gen - this combines /inbox, /classify, and /sendmail and does them all from reading inobx and classifying labels and genarting content to finally sending the mail
(Note due to rate limits of Gemini we can only create 2 responses/minute this leaves us with only sending two mails/minute and thus the power of BULLMQ has been not used though implemented in the sendMailInQueueUtil mail utility function and if u have access to a paid tier of gemini or even openai api you can use this instead of the normal sendMailUtil function to bring concurrency to the app)

commit 2 sees for this and brings in authentication ( Note this means you cannot access the api without auth b ut this implements a full fledged auth + usage flow for the app )

If you want to use this project as command line utility you can make use of the functions I created in mailUtils.js file they are able to execute on their own being separate from any web app.

Also here is a simple React Client you can use to access this application
https://github.com/HRIDYANSHU054/MyMails-Client
