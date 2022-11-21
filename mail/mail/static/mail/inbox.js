document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');
});

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
                    body: body,
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

    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name

    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    if (mailbox == 'sent') {

        fetch('/emails/sent').then(response => response.json())
            .then(emails => {
                console.log(emails);
                emails.forEach(email => {
                    // create html to display the emails content
                    let emailDivLeft = document.createElement('div');
                    emailDivLeft.setAttribute('id', email.id);
                    emailDivLeft.setAttribute('class', 'emailDiv');
                    let recipient = document.createElement('h4');
                    recipient.innerText = email.recipients;
                    let subject = document.createElement('h5');
                    subject.innerText = email.subject;
                    let timestamp = document.createElement('p');
                    timestamp.innerText = email.timestamp;
                    emailDivLeft.appendChild(recipient);
                    emailDivLeft.appendChild(subject);
                    emailDivLeft.appendChild(timestamp);
                    document.querySelector('#emailDiv').appendChild(emailDivLeft);
                });
            }).catch(error => console.log(error));
    }
    return 0;
}