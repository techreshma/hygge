let y =[
    {
        title:"New Reward Available",
        body:"A fantastic new reward has been added to Hygge. Earn more points to redeem."
    }, 
    {
        title:"New Challenge Activated",
        body:"Come back to Hygge: there is a new challenge waiting for you.",
    },
    {
        title:"Leave acceptance - User",
        body:"Your request for [insert type of leave] leave has been approved!",
    },
    
    {
        title:"Leave rejection - User",    
        body:"Your request for [insert type of leave] leave has been declined because [insert reason].",
    },
    {
        title:"Challenge Started",
        body:"[First Name], are you ready to face a new challenge?",
        info: "Yes, let’s go I’ll be back"
    },
    {
        title:"Challenge Completed",
        body:"Congratulations! [First Name], you have completed {insert challenge name} and earned [Reward points] points. Would you like to redeem your reward?",
        info:"Redeem Reward"/"Maybe later"
    },   
    {
        title:"Birthday Notification",    
        body:"Happy Birthday, [First Name]!",
    },
    {
        title:"Work Anniversary Notification",    
        body:"You’ve completed x years at company name. Happy Work Anniversary, [First Name]!",
    },
    {
        title:"Survey added Notification",
        body:"Hey [First Name], we have added a new survey for you.",
        info:"Take me to the survey I will fill it out later"
    },  
    {
        title:"Survey submit",
        body:"[First Name], are you ready to share your responses?",
        info:"Yes! I want to change something"
    },  
    {
        title: "Completed survey reminder",
        body:  "Hey [First Name], are you ready to share your responses for [survey name]?",
        info:  "Complete it now Remind me tomorrow"
    },
    {
        title:"Document Notification(Expiry)",
        body:"Hi [First Name]! It’s time to update your <expired document name> document",
        info:"Upload Now Remind Me {Tonight / Tomorrow}"
    },
    {
       title:"Document Missing",
       body:"Hi [First Name], something’s missing!",
       info:"Upload your <Missing document name> document"
    },
    {
        title:"Holiday Announcement",
        body:"name of company will be closed on {insert dates} on account of {insert holiday name} Greetings can be added after this such as Eid Mubarak! - Merry Christmas / Seasons Greetings - Happy UAE National Day"
    },   
    {
        title:"Events/Calendar",
        body:"Your calendar has been updated!",
        Info:"See updates /I will check it out later"
    }
    ]
// {
//     title:Leave Request - Manager,
//     body:You have received a new [Leave type] leave request from [insert name of employee].,
//     info:
//     Accept
//     Decline & Enter Reason
// }


// Reward Notification, Reward/Voucher redeemed
// For user 
// {
//     title:Reward Notification,
//     body:Hi [First Name], would you like to redeem your reward now?,
//     info:Yes!No
// }


// If yes is selected
// {
//     title:Reward Notification,
//     body:Congratulations on making it this far! You will be receiving more details about your reward in an email or can contact [HR Admin name].,
// }


// For manager
// {
//     title:Reward/Voucher redeemed,
//     body:Hi [First Name],  [employee’s name] has redeemed [Name of reward].,
// }


// Company Expire Notification
// For HR 
// {
//     title:Company Expire Notification,
//     body:Your Subscription to Hygge will expire on <insert date>.,
//     info:I would like to renew Remind me later
// }

// For Hygge staff
// {
//     title:Company Expire Notification,
//     body:[Company Name]’s  contract will expire on <insert date>.,
//     info:Send an email
//     Remind me later
// }

// {
//     title:Call Notification,
//     body: You have a new message from <First Name>,
//     info:
//     Reply
//     Let’s talk later
// }

// If the second option is selected, then the other person will receive an auto message:
// <First Name> is busy / away 

// {
//     title:Missed Call notification,
//     body:Hi [First Name], you missed a call from [First Name or no.] on [day, date] at [time],
//     info:
//     Call Now
//     Call Later
// }


// {
//     title:Retake HRA,
//     body:Hi [First Name], would you like to complete the HRA again and discover new ways to improve your Hygge?,
//     info:
//     Yes!
//     I will do it later
// }

// {
//     title:Events - From Calendar,
//     body:Hi [First Name], a new event has been added to the calendar.,
// }

// {
//     title:App - Updates,
//     body:We’ve made some awesome changes. Update now!,
// }

// {
//     title:Enable location,
//     body:Do you want to allow Hygge to access your location?
//     ‘Location access is required for attendance and other functions’,
//     Info:
//     Allow Once
//     Allow while using app
//     Don’t Allow
// }