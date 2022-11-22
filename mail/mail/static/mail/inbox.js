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
    let emailSection = document.querySelector('#single-email-view');
    let header = document.createElement('div');
    let leftHeader = document.createElement('div');
    let rightHeader = document.createElement('div');
    let body = document.createElement('div');
    let archive = document.createElement('button');
    let reply = document.createElement('button');

    // Create the elements for the left side of the header //
    let subject = document.createElement('h4')
    subject.innerText = email.subject;
    let sender = document.createElement('h6')
    sender.innerText = ("From: " + email.sender);
    //  TODO:  We will want to display something to imply that this select menu is just recipients //
    let recipients = document.createElement('select');
    email.recipients.forEach(user => {
        let option = document.createElement('option');
        option.innerText = user;
        recipients.appendChild(option);
    })
    leftHeader.appendChild(subject);
    leftHeader.appendChild(sender);
    leftHeader.appendChild(recipients);
    header.appendChild(leftHeader);
    // Create the elements for the right side of the header //

    emailSection.appendChild(header);
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
    const singleEmailView = document.querySelector('#single-email-view');
    emailsView.style.display = 'block';
    composeView.style.display = 'none';
    singleEmailView.style.display = 'none';
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
                        emailsView.style.display = 'none';
                        singleEmailView.style.display = 'block';
                        full_email(email);

                    });
                }).catch(error => console.log(error));
            })
    }
    if (mailbox === 'inbox') {
        fetch('/emails/inbox').then(response => response.json())
            .then(emails => {
                console.log(emails);
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
                        emailsView.style.display = 'none';
                        singleEmailView.style.display = 'block';
                        full_email(email);
                    });
                })
            })
    }
    return 0;
}