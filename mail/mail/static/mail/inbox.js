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

    currentUser = document.querySelector('h2').innerText;
    currUserName = currentUser.split(/@/i);
    currUserName = currUserName[0];
    currUserName = currUserName.charAt(0).toUpperCase() + currUserName.slice(1);

    let header = document.createElement('div');
    header.setAttribute('id', "header");
    let leftHeader = document.createElement('div');
    leftHeader.setAttribute('id', "left-header");
    let rightHeader = document.createElement('div');
    rightHeader.setAttribute('id', "right-header");
    let bodyContainer = document.createElement('div');
    bodyContainer.setAttribute('id', "body-container");
    let body = document.createElement('div');
    body.setAttribute('id', "email-body");
    let archive = document.createElement('button');
    archive.setAttribute('id', "archive");
    archive.setAttribute('class', "myButtons");
    let reply = document.createElement('button');
    reply.setAttribute('id', "reply");
    reply.setAttribute('class', "myButtons");
    let replyAll = document.createElement('button');
    replyAll.setAttribute('id', "reply-all");
    replyAll.setAttribute('class', "myButtons");
    let footer = document.createElement('div');
    let replyTip = document.createElement('span');
    let archiveTip = document.createElement('span');
    let replyAllTip = document.createElement('span');
    replyTip.innerText = 'Reply';
    replyAllTip.innerText = 'Reply All';
    archiveTip.innerText = 'Archive';
    replyAll.appendChild(replyAllTip);
    reply.appendChild(replyTip);
    archive.appendChild(archiveTip);

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
    firstOption.setAttribute("value", "");
    recipients.appendChild(firstOption);
    email.recipients.forEach(user => {
        let option = document.createElement('option');
        option.innerText = user;
        option.setAttribute("value", user);
        recipients.appendChild(option);
    })
    console.log("id " + email.id)
        // EVENT LISTENERS FOR REPLIES AND ARCHIVES // 
    archive.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: placeholder
            })
        }).catch(error => alert("email archive failed: " + error))
        location.reload(true);
        load_mailbox("inbox");
        return 0;
    });
    reply.addEventListener('click', function() {
            // Hide the email view and load compose view
            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#compose-view').style.display = 'block';
            // modify compose subject field to match current emails subject and recipient should match current emails sender
            document.querySelector('#compose-subject').setAttribute('value', "Re: " + email.subject);
            // Need to check the select menu and get its value
            console.log(recipients.value);
            if (recipients.value != "") {
                document.querySelector('#compose-recipients').setAttribute('value', recipients.value);
            } else {
                document.querySelector('#compose-recipients').setAttribute('value', email.sender);
            }
            document.querySelector('#compose-body').innerText = `${currUserName}'s response to ${usernameString}'s email: ${email.body}.`;
        })
        // replyAll event lister
    replyAll.addEventListener('click', function() {
        let all = []
        email.recipients.forEach(user => {
            if (user != currentUser) {
                all.push(user);
            }
        })
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'block';
        document.querySelector('#compose-subject').setAttribute('value', "Re: " + email.subject);
        document.querySelector('#compose-body').innerText = `${currUserName}'s response to ${usernameString}'s email: ${email.body}.`;
        document.querySelector('#compose-recipients').setAttribute('value', all + "," + email.sender);
    });
    // FILLS RIGHT HEADER //
    var placeholder;
    let timestamp = document.createElement('p');
    timestamp.innerText = email.timestamp;
    rightHeader.appendChild(timestamp);
    console.log("archive status " + email.archived);
    let archiveImage = document.createElement('img');
    archiveImage.src = "static/mail/images/archive.png";
    let unarchiveImage = document.createElement('img');
    unarchiveImage.src = "static/mail/images/unarchive.jpg";
    if (email.sender == currentUser) {
        archive.style.display = 'none';
    } else if (email.archived == true) {
        archive.appendChild(unarchiveImage);
        placeholder = false;
    } else {
        archive.appendChild(archiveImage);
        placeholder = true;

    }
    let replyImage = document.createElement('img');
    replyImage.src = "static/mail/images/reply.png";
    let replyAllImage = document.createElement('img')
    replyAllImage.src = "static/mail/images/replyall.png";
    reply.appendChild(replyImage);
    replyAll.appendChild(replyAllImage);
    footer.appendChild(reply);
    footer.appendChild(replyAll);
    footer.appendChild(archive);

    console.log("placeholders value: " + placeholder);

    // FILLS BODY AND BUTTONS //
    body.innerHTML = email.body;


    leftHeader.appendChild(sender);
    leftHeader.appendChild(recipients);
    header.appendChild(leftHeader);
    header.appendChild(rightHeader);
    rightHeader.appendChild(footer);
    emailSection.appendChild(header);
    emailSection.appendChild(document.createElement('hr'));
    bodyContainer.appendChild(body);
    emailSection.appendChild(bodyContainer);


    emailsView.appendChild(emailSection);
    return 0;

    // LISTENS TO BUTTONS//
}

function compose_send() {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
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
        }).catch(error => console.log(error));
    localStorage.clear();
    load_mailbox('sent');
    return false;

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
    document.querySelector('#compose-form').addEventListener('submit', compose_send)
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
        event.preventDefault();
        fetch('/emails/sent').then(response => response.json())
            .then(emails => {
                console.log(emails);
                emails.forEach(email => {
                    // create html to display the emails content
                    emailDiv = display_mail(email);

                    emailDiv.addEventListener('click', function() {

                        full_email(email);

                    });
                })
            }).catch(error => console.log(error));
    } else if (mailbox == 'archive') {

        fetch('/emails/archive').then(response => response.json())
            .then(emails => {
                console.log("email array: " + emails);
                if (emails.length <= 0) {
                    return 1;
                }
                emails.forEach(email => {
                    // create html to display the emails content
                    emailDiv = display_mail(email);
                    if (email.read) {
                        emailDiv.style["background-color"] = ("rgba(192,192,192,.4");
                    }

                    emailDiv.addEventListener('click', function() {

                        full_email(email);

                    });
                }).catch(error => console.log(error));
            })
    } else if (mailbox === 'inbox') {

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
                    if (email.read) {
                        emailDiv.style["background-color"] = ("rgba(192,192,192,.4");
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