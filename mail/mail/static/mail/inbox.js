document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');
});

//------- FUNCTION WILL BE USED IN FOR EACH LOOP LOADS EMAIL USING PASSED ARGUMENT ---------/
function display_mail(email) {
    let emailDiv = document.createElement('div');
    emailDiv.setAttribute('id', email.id);
    emailDiv.setAttribute('class', "emailDiv")
    let sender = document.createElement('h4');
    sender.innerText = email.sender;
    let subject = document.createElement('h5');
    subject.innerText = email.subject;
    let timestamp = document.createElement('p');
    timestamp.innerText = email.timestamp;
    emailDiv.appendChild(sender);
    emailDiv.appendChild(subject);
    emailDiv.appendChild(timestamp);
    document.querySelector('#emails-view').appendChild(emailDiv);

    return emailDiv;
}
// ---------    FUNCTION WILL BE USED TO DISPLAY A SINGLE EMAIL USED IN EACH INBOX ---------------- //
function full_email(email) {
    emailsView = document.querySelector('#emails-view');
    while (emailsView.firstChild) {
        emailsView.removeChild(emailsView.firstChild);
    }
    let emailSection = document.createElement('div');
    emailSection.setAttribute('id', 'single-email-view');


    let header = document.createElement('div');
    header.setAttribute('id', "header");
    let leftHeader = document.createElement('div');
    leftHeader.setAttribute('id', "left-header");
    let rightHeader = document.createElement('div');
    rightHeader.setAttribute('id', "right-header");
    let body = document.createElement('div');
    body.setAttribute('id', "eamil-body");
    let archive = document.createElement('button');
    archive.setAttribute('id', "archive");
    let reply = document.createElement('button');
    reply.setAttribute('id', "reply");
    let replyAll = document.createElement('button');
    replyAll.setAttribute('id', "reply-all");


    // FILLS LEFT HEADER //

    let usernameString = email.sender.split(/@/i);
    usernameString = usernameString[0];
    usernameString = usernameString.charAt(0).toUpperCase() + usernameString.slice(1);
    let sender = document.createElement('p')
    sender.innerText = (`${usernameString} <${email.sender}>`);
    let recipients = document.createElement('select');
    let firstOption = document.createElement('option');
    firstOption.innerText = "Recipients: ";
    firstOption.setAttribute("disabled", "true");
    firstOption.setAttribute("selected", "true");
    recipients.appendChild(firstOption);
    email.recipients.forEach(user => {
        let option = document.createElement('option');
        option.innerText = user;
        recipients.appendChild(option);
    })
    console.log("id " + email.id)
    archive.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: placeholder
            })
        }).catch(error => alert("email archive failed: " + error))
        load_mailbox("inbox")
    });

    // FILLS RIGHT HEADER //
    var placeholder;
    let timestamp = document.createElement('p');
    timestamp.innerText = email.timestamp;
    rightHeader.appendChild(timestamp);
    console.log("archive status " + email.archived);
    if (email.archived == true) {
        archive.innerText = "Unarchive";
        placeholder = false;
    } else {
        archive.innerText = "Archive";
        placeholder = true;

    }
    rightHeader.appendChild(archive);
    console.log("placeholders value: " + placeholder);

    // FILLS BODY AND BUTTONS //

    body.innerText = email.body;



    leftHeader.appendChild(sender);
    leftHeader.appendChild(recipients);
    header.appendChild(leftHeader);
    header.appendChild(rightHeader);
    emailSection.appendChild(header);
    emailsView.appendChild(emailSection);
    // LISTENS TO BUTTONS//
}

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';



    // Once page is cleared, and loaded we will want to listen to the submit button 
    document.querySelector('#compose-form').addEventListener('submit', function() {
        let recipients = document.querySelector('#compose-recipients').value;
        let subject = document.querySelector('#compose-subject').value;
        let body = document.querySelector('#compose-body').value;

        fetch('/emails', {
                method: 'POST',
                body: JSON.stringify({
                    recipients: recipients,
                    subject: subject,
                    body: body
                })
            })
            .then(response => response.json())
            .then(result => {
                // Print result
                console.log(result);
                if (result.status === 201) {
                    load_mailbox('sent')
                } else {
                    alert(result['error'])
                }
            }).catch(error => console.log(error))


    });
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views

    const emailsView = document.querySelector('#emails-view');
    const composeView = document.querySelector('#compose-view');
    emailsView.style.display = 'block';
    composeView.style.display = 'none';
    // Show the mailbox name

    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    if (mailbox == 'sent') {
        fetch('/emails/sent').then(response => response.json())
            .then(emails => {
                console.log(emails);
                emails.forEach(email => {
                    // create html to display the emails content
                    emailDiv = display_mail(email);

                    emailDiv.addEventListener('click', function() {

                        full_email(email);

                    });
                }).catch(error => console.log(error));
            })
    }
    if (mailbox == 'archive') {
        fetch('/emails/archive').then(response => response.json())
            .then(emails => {
                console.log("email array: " + emails);
                if (emails.length <= 0) {
                    return 1;
                }
                emails.forEach(email => {
                    // create html to display the emails content
                    emailDiv = display_mail(email);

                    emailDiv.addEventListener('click', function() {

                        full_email(email);

                    });
                }).catch(error => console.log(error));
            })
    }
    if (mailbox === 'inbox') {
        fetch('/emails/inbox').then(response => response.json())
            .then(emails => {
                console.log("email array: " + emails);
                if (emails.length <= 0) {
                    return 1;
                }
                emails.forEach(email => {
                    // create html to display the emails content
                    emailDiv = display_mail(email);
                    // Need to add view email function
                    if (!email.read) {
                        emailDiv.style["background-color"] = ("rgba(192, 192, 192");
                    }
                    emailDiv.addEventListener('click', function() {
                        // Here i will want to display the email and have buttons to archive should also set read to true and maybe a delete button??
                        fetch(`/emails/${email.id}`, {
                            method: 'PUT',
                            body: JSON.stringify({ read: true })
                        }).catch(error => console.log(error));

                        full_email(email);
                    });
                })
            })
    }
    return 0;
}