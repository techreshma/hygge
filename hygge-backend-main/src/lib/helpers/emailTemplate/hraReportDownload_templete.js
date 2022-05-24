module.exports.hraReportDowwnloadFunction = function (
  body,
  lifestyle,
  mind,
  personal,
  Biometrics,
  clinicalHistory,
  screening,
  familyHistory,
  occupationalHistory,
  diet,
  physicalActivity,
  sleep,
  stressAndMentalWellbeing,
  readinessAssessment,
  tobacco,
  beverges,
  userName,
  userAge,
  userGender
) {
  let bodyTotal = 51;
  let lifestyleTotal = 30;
  let mindTotal = 19;
  let personalTotal = 5;
  let BiometricsTotal = 7;
  let clinicalHistoryTotal = 26;
  let screeningTotal = 2;
  let familyHistoryTotal = 5;
  let occupationalHistoryTotal = 12;
  let dietTotal = 12;
  let physicalActivityTotal = 3;
  let sleepTotal = 6;
  let bevergesTotal = 5;
  let tobaccoTotal = 4;
  let stressAndMentalWellbeingTotal = 16.5;

  var totalHra = Math.round(Number(body) + Number(mind) + Number(lifestyle));

  const d = new Date();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let yyyy = d.getFullYear();
  let mm = monthNames[d.getMonth()];
  let dd = d.getDate();

  let dateOfReport = mm + " " + dd + "," + yyyy;

  var bodyData =
    body >= 31.4 && body <= 51
      ? "LOW "
      : body >= 18 && body <= 30.4
      ? "MEDIUM"
      : body <= 17.9
      ? "HIGH"
      : "";

  var bodyReport =
    body >= 31.4 && body <= 51
      ? "That is you are at Low risk and doing good"
      : body >= 18 && body <= 30.4
      ? "That is you are at medium risk and need attention"
      : body <= 17.9
      ? "That is you are at high risk and take action"
      : "";

  var lifestyleData =
    lifestyle >= 18 && lifestyle <= 30
      ? "LOW"
      : lifestyle >= 10.5 && lifestyle <= 17.9
      ? "MEDIUM"
      : lifestyle <= 10.5
      ? "HIGH"
      : "";

  var lifestyleReport =
    lifestyle >= 18 && lifestyle <= 30
      ? "That is you are at Low risk and doing good"
      : lifestyle >= 10.5 && lifestyle <= 17.9
      ? "That is you are at medium risk and need attention"
      : lifestyle <= 10.5
      ? "That is you are at high risk and take action"
      : "";

  var mindData =
    mind >= 11.5 && mind <= 19
      ? "LOW"
      : mind >= 6.5 && mind <= 11.4
      ? "MEDIUM"
      : mind <= 6.4
      ? "HIGH"
      : "";

  var mindReport =
    mind >= 11.5 && mind <= 19
      ? "That is you are at Low risk and doing good"
      : mind >= 6.5 && mind <= 11.4
      ? "That is you are at medium risk and need attention"
      : mind <= 6.4
      ? "That is you are at high risk and take action"
      : "";

  var personalReport =
    Math.round((personal / personalTotal) * 100) >= 60 &&
    Math.round((personal / personalTotal) * 100) <= 100
      ? "Age is on your side, pick right habits early on. There has been a rise in obesity and also metabolic complaints for young adults too. Let us create a new wave of ‘healthy YOUth’ by being ultra mindful everyday! "
      : Math.round((personal / personalTotal) * 100) >= 35 &&
        Math.round((personal / personalTotal) * 100) < 60
      ? "With age our metabolism lowers and healing process gets delayed. At your age, one must consider their family history & regular health check-up to create a lifestyle that fits best to your needs.  "
      : Math.round((personal / personalTotal) * 100) < 35
      ? "Recommendation for your age is to focus on regular screening. Health screening allows you to stay a step ahead and proactively bring healthy changes.  "
      : "";
  var personalRecommendation =
    Math.round((personal / personalTotal) * 100) >= 60 &&
    Math.round((personal / personalTotal) * 100) <= 100
      ? "Focus on all 5 dimensions of healthy living- good diet, staying active, restful sleep & sound mental health.  "
      : Math.round((personal / personalTotal) * 100) >= 35 &&
        Math.round((personal / personalTotal) * 100) < 60
      ? "You can turn things around if you start now ! We recommend you to focus on being mindful towards yourself. Modify your diet as per your health needs. Adhere to an ‘Annual screening’ for metabolic concerns whether or not it runs in your family. "
      : Math.round((personal / personalTotal) * 100) < 35
      ? "It is always the right time to bring a healthy change in life. In a nutshell we recommend - Regularly screen yourself Manage weight and keep it within healthy range. Make choices in food that supports your wellbeing. "
      : "";
  var personalData =
    Math.round((personal / personalTotal) * 100) >= 60 &&
    Math.round((personal / personalTotal) * 100) <= 100
      ? "lOW"
      : Math.round((personal / personalTotal) * 100) >= 35 &&
        Math.round((personal / personalTotal) * 100) < 60
      ? "MEDIUM"
      : Math.round((personal / personalTotal) * 100) < 35
      ? "HIGH"
      : "";

  var BiometricsReport =
    Math.round((Biometrics / BiometricsTotal) * 100) >= 60 &&
    Math.round((Biometrics / BiometricsTotal) * 100) <= 100
      ? "Your BMI indicates that you are close to your range of ideal weight."
      : Math.round((Biometrics / BiometricsTotal) * 100) >= 35 &&
        Math.round((Biometrics / BiometricsTotal) * 100) < 60
      ? "Your BMI and waist hip ratio needs some attention. Keep calm and create a goal enabled plan to manage your health.  "
      : Math.round((Biometrics / BiometricsTotal) * 100) < 35
      ? "It seems like your BMI is not in the healthy range. You might want to focus on weight reduction. There are various options and to initiate this journey, you can speak to your doctor to identify the best way forward.  "
      : "";
  var BiometricsRecommendation =
    Math.round((Biometrics / BiometricsTotal) * 100) >= 60 &&
    Math.round((Biometrics / BiometricsTotal) * 100) <= 100
      ? "Maintain this healthy range of weight. "
      : Math.round((Biometrics / BiometricsTotal) * 100) >= 35 &&
        Math.round((Biometrics / BiometricsTotal) * 100) < 60
      ? "In order to reduce weight-  The combination of a calorie deficit diet and increased physical activity is recommended. "
      : Math.round((Biometrics / BiometricsTotal) * 100) < 35
      ? "In order to bring a gradual weight loss- The combination of a calorie deficit diet and increased physical activity is recommended. We also suggest to speak to a Dietician who can create a bespoke meal plan that can handhold you to eat the right portion and quality of food. Consult a health professional for relevant screening & support.   "
      : "";
  var BiometricsData =
    Math.round((Biometrics / BiometricsTotal) * 100) >= 60 &&
    Math.round((Biometrics / BiometricsTotal) * 100) <= 100
      ? "LOW"
      : Math.round((Biometrics / BiometricsTotal) * 100) >= 35 &&
        Math.round((Biometrics / BiometricsTotal) * 100) < 60
      ? "MEDIUM"
      : Math.round((Biometrics / BiometricsTotal) * 100) < 35
      ? "HIGH"
      : "";

  var clinicalHistoryReport =
    Math.round((clinicalHistory / clinicalHistoryTotal) * 100) >= 60 &&
    Math.round((clinicalHistory / clinicalHistoryTotal) * 100) <= 100
      ? "Your clinical history indicates that  you are not at any major risk of developing any Metabolic disease.  "
      : Math.round((clinicalHistory / clinicalHistoryTotal) * 100) >= 35 &&
        Math.round((clinicalHistory / clinicalHistoryTotal) * 100) < 60
      ? "Your clinical history indicates possible health concerns. "
      : Math.round((clinicalHistory / clinicalHistoryTotal) * 100) < 35
      ? "Your clinical history indicates health concerns . A cluster of abnormal tests like blood glucose, cholesterol or BP puts a greater risk of developing lifestyle diseases in the future.   "
      : "";
  var clinicalHistoryRecommendation =
    Math.round((clinicalHistory / clinicalHistoryTotal) * 100) >= 60 &&
    Math.round((clinicalHistory / clinicalHistoryTotal) * 100) <= 100
      ? "After 35 year of age, it is recommended to be clinically screened at least once a year."
      : Math.round((clinicalHistory / clinicalHistoryTotal) * 100) >= 35 &&
        Math.round((clinicalHistory / clinicalHistoryTotal) * 100) < 60
      ? "We recommend to speak to a health provider and discus a regular screening plan for present concerns & follow relevant lifestyle changes to bring gradual "
      : Math.round((clinicalHistory / clinicalHistoryTotal) * 100) < 35
      ? "As per your concerns, the health provider will plan a screening once or twice a year. We recommend to use the ‘Health Record’ feature for storing as well as analysing your health data. "
      : "";
  var clinicalHistoryData =
    Math.round((clinicalHistory / clinicalHistoryTotal) * 100) >= 60 &&
    Math.round((clinicalHistory / clinicalHistoryTotal) * 100) <= 100
      ? "LOW"
      : Math.round((clinicalHistory / clinicalHistoryTotal) * 100) >= 35 &&
        Math.round((clinicalHistory / clinicalHistoryTotal) * 100) < 60
      ? "MEDIUM"
      : Math.round((clinicalHistory / clinicalHistoryTotal) * 100) < 35
      ? "HIGH"
      : "";

  var screeningReport =
    Math.round((screening / screeningTotal) * 100) >= 60 &&
    Math.round((screening / screeningTotal) * 100) <= 100
      ? "You are doing great. Keep it up! Staying immunised keeps you and your loved ones healthy and protected. Keep it up-to-date. "
      : Math.round((screening / screeningTotal) * 100) >= 35 &&
        Math.round((screening / screeningTotal) * 100) < 60
      ? "Health screening includes, dental, eye as well as overall physical examination and test screening. Regular screening informs us at the right time of any impending health concerns. "
      : Math.round((screening / screeningTotal) * 100) < 35
      ? "Please focus on your regular check up. Consult your primary care physician at the nearest clinical centre and get started. "
      : "";
  var screeningRecommendation =
    Math.round((screening / screeningTotal) * 100) >= 60 &&
    Math.round((screening / screeningTotal) * 100) <= 100
      ? ""
      : Math.round((screening / screeningTotal) * 100) >= 35 &&
        Math.round((screening / screeningTotal) * 100) < 60
      ? ""
      : Math.round((screening / screeningTotal) * 100) < 35
      ? ""
      : "";
  var screeningData =
    Math.round((screening / screeningTotal) * 100) >= 60 &&
    Math.round((screening / screeningTotal) * 100) <= 100
      ? "LOW"
      : Math.round((screening / screeningTotal) * 100) >= 35 &&
        Math.round((screening / screeningTotal) * 100) < 60
      ? "MEDIUM"
      : Math.round((screening / screeningTotal) * 100) < 35
      ? "HIGH"
      : "";

  var familyHistoryReport =
    Math.round((familyHistory / familyHistoryTotal) * 100) >= 60 &&
    Math.round((familyHistory / familyHistoryTotal) * 100) <= 100
      ? "Great news, you do not seem to have any family history for lifestyle and metabolic concerns. This put you at lesser risk towards chronic lifestyle diseases. "
      : Math.round((familyHistory / familyHistoryTotal) * 100) >= 35 &&
        Math.round((familyHistory / familyHistoryTotal) * 100) < 60
      ? "It is quite common to have some history of chronic diseases in the family. You have a positive family history for metabolic illnesses."
      : Math.round((familyHistory / familyHistoryTotal) * 100) < 35
      ? "You have a strong history of chronic lifestyle diseases in the family."
      : "";
  var familyHistoryRecommendation =
    Math.round((familyHistory / familyHistoryTotal) * 100) >= 60 &&
    Math.round((familyHistory / familyHistoryTotal) * 100) <= 100
      ? "No family history of metabolic concern does not rule out your risk to develop any yourself. We recommend to follow basic healthy living practices. "
      : Math.round((familyHistory / familyHistoryTotal) * 100) >= 35 &&
        Math.round((familyHistory / familyHistoryTotal) * 100) < 60
      ? "Fine tune your habits, eating choices as per your current health needs as well as family history. E.g. Cut down on sugar, if you have a strong diabetes history in your family. "
      : Math.round((familyHistory / familyHistoryTotal) * 100) < 35
      ? "Fine tune your habits, eating choices as per your current health needs as well as family history. Cut down on sugar, if you have a strong diabetes history in your family. "
      : "";
  var familyHistoryData =
    Math.round((familyHistory / familyHistoryTotal) * 100) >= 60 &&
    Math.round((familyHistory / familyHistoryTotal) * 100) <= 100
      ? "LOW"
      : Math.round((familyHistory / familyHistoryTotal) * 100) >= 35 &&
        Math.round((familyHistory / familyHistoryTotal) * 100) < 60
      ? "MEDIUM"
      : Math.round((familyHistory / familyHistoryTotal) * 100) < 35
      ? "HIGH"
      : "";

  var occupationalHistoryReport =
    Math.round((occupationalHistory / occupationalHistoryTotal) * 100) >= 60 &&
    Math.round((occupationalHistory / occupationalHistoryTotal) * 100) <= 100
      ? "Analysed based on your overall level of comfort at work, your musculoskeletal health, level of fitness and other data relevant to workplace wellbeing. As per your given feedback and given choices, you are at a LOW risk of occupational related health concern/s. "
      : Math.round((occupationalHistory / occupationalHistoryTotal) * 100) >=
          35 &&
        Math.round((occupationalHistory / occupationalHistoryTotal) * 100) < 60
      ? "This has been deduced based on your overall level of comfort at work, your musculoskeletal health, level of fitness and other data relevant to workplace wellbeing. As per your given feedback and given choices, you are at a MODERATE risk of occupational related health "
      : Math.round((occupationalHistory / occupationalHistoryTotal) * 100) < 35
      ? "This has been deduced based on your overall level of comfort at work, your musculoskeletal health, level of fitness and other data relevant to workplace wellbeing. As per your given feedback and given choices, you are at a HIGH risk of occupational related health concern/s"
      : "";
  var occupationalHistoryRecommendation =
    Math.round((occupationalHistory / occupationalHistoryTotal) * 100) >= 60 &&
    Math.round((occupationalHistory / occupationalHistoryTotal) * 100) <= 100
      ? "You are doing brilliantly well. Kudos. "
      : Math.round((occupationalHistory / occupationalHistoryTotal) * 100) >=
          35 &&
        Math.round((occupationalHistory / occupationalHistoryTotal) * 100) < 60
      ? "Focus on concerns that act as barriers to your work life. E.g. if you have pain/stiffness that keeps you from being active, productive and efficient then focus on improving that with the support of a therapist. Bring valuable change on any lifestyle factor which can improve your day- e.g. better quality sleep. Adapt to a work behaviour which is healthy and strikes a balance. Seek support at workplace to make changes to your workstation if needed."
      : Math.round((occupationalHistory / occupationalHistoryTotal) * 100) < 35
      ? "Focus on concerns that act as barriers to your work life. E.g. if you have pain/stiffness that keeps you from being active, productive and efficient then focus on improving that with the support of a therapist. Bring valuable change on any lifestyle factor which can improve your day- e.g. better quality sleep. Adapt to a work behaviour which is healthy and strikes a balance. Seek support at workplace to make changes to your workstation if needed."
      : "";
  var occupationalHistoryData =
    Math.round((occupationalHistory / occupationalHistoryTotal) * 100) >= 60 &&
    Math.round((occupationalHistory / occupationalHistoryTotal) * 100) <= 100
      ? "LOW"
      : Math.round((occupationalHistory / occupationalHistoryTotal) * 100) >=
          35 &&
        Math.round((occupationalHistory / occupationalHistoryTotal) * 100) < 60
      ? "MEDIUM"
      : Math.round((occupationalHistory / occupationalHistoryTotal) * 100) < 35
      ? "HIGH"
      : "";

  var dietReport =
    Math.round((diet / dietTotal) * 100) >= 60 &&
    Math.round((diet / dietTotal) * 100) <= 100
      ? "Good nutrition means your body gets all the nutrients, vitamins, and minerals it needs to work its best. You follow a healthy and well-balanced diet. Staying consistent is the key, keep it up !"
      : Math.round((diet / dietTotal) * 100) >= 35 &&
        Math.round((diet / dietTotal) * 100) < 60
      ? "Based on your choice it seems like you are unable to keep healthy dietary choices all the time. Keeping track of what eating choices you make in a day will help you improve your diet. "
      : Math.round((diet / dietTotal) * 100) < 35
      ? "Food is information, not just calories. Hence the quantity, quality and value in it is significant. It seems like you really need to re-visit your eating habits & food choices. Please prioritise this over other tasks."
      : "";
  var dietRecommendation =
    Math.round((diet / dietTotal) * 100) >= 60 &&
    Math.round((diet / dietTotal) * 100) <= 100
      ? "Mostly you eat healthy- hence we congratulate you for being an inspiration for everyone around you !  "
      : Math.round((diet / dietTotal) * 100) >= 35 &&
        Math.round((diet / dietTotal) * 100) < 60
      ? "Log your food with time to get details of your food choices & habits. Plan your meal times for main meals and snacks. Keep a disciplined eating routine. "
      : Math.round((diet / dietTotal) * 100) < 35
      ? "Log your food with time to get details of your food choices & habits. Plan your meal times for main meals and snacks. Keep a disciplined eating routine. Keep yourself 1-2 reward days to balance everything and bring sustainability.  "
      : "";
  var dietData =
    Math.round((diet / dietTotal) * 100) >= 60 &&
    Math.round((diet / dietTotal) * 100) <= 100
      ? "LOW"
      : Math.round((diet / dietTotal) * 100) >= 35 &&
        Math.round((diet / dietTotal) * 100) < 60
      ? "MEDIUM"
      : Math.round((diet / dietTotal) * 100) < 35
      ? "HIGH"
      : "";

  var physicalActivityReport =
    Math.round((physicalActivity / physicalActivityTotal) * 100) >= 60 &&
    Math.round((physicalActivity / physicalActivityTotal) * 100) <= 100
      ? "You are physically active and get to exercise regularly for a sufficient amount of time. Stay active!"
      : Math.round((physicalActivity / physicalActivityTotal) * 100) >= 35 &&
        Math.round((physicalActivity / physicalActivityTotal) * 100) < 60
      ? "Routine movements of the day is not enough for an active living. You do not meet the basic level of activity per week.  "
      : Math.round((physicalActivity / physicalActivityTotal) * 100) < 35
      ? "Your level of activity is quite sedentary. This will slow down your metabolism, affect your mobility and might result in weight gain. "
      : "";
  var physicalActivityRecommendation =
    Math.round((physicalActivity / physicalActivityTotal) * 100) >= 60 &&
    Math.round((physicalActivity / physicalActivityTotal) * 100) <= 100
      ? "Keep it up ! "
      : Math.round((physicalActivity / physicalActivityTotal) * 100) >= 35 &&
        Math.round((physicalActivity / physicalActivityTotal) * 100) < 60
      ? "Plan constructive workout to sweat out is essential and try to achieve this at least 3 times a week for 30 minutes. If you do not have any activity then start with a 15 minutes walk/ swimming for the first month "
      : Math.round((physicalActivity / physicalActivityTotal) * 100) < 35
      ? "Plan constructive workout to sweat out is essential and try to achieve this at least 3 times a week for 30 minutes. If you’re not sure because you’re afraid of getting hurt, the good news is that moderate-intensity aerobic activity, such as brisk walking, water aerobics is generally safe for most people. "
      : "";
  var physicalActivityData =
    Math.round((physicalActivity / physicalActivityTotal) * 100) >= 60 &&
    Math.round((physicalActivity / physicalActivityTotal) * 100) <= 100
      ? "LOW"
      : Math.round((physicalActivity / physicalActivityTotal) * 100) >= 35 &&
        Math.round((physicalActivity / physicalActivityTotal) * 100) < 60
      ? "MEDIUM"
      : Math.round((physicalActivity / physicalActivityTotal) * 100) < 35
      ? "HIGH"
      : "";

  var sleepReport =
    Math.round((sleep / sleepTotal) * 100) >= 60 &&
    Math.round((sleep / sleepTotal) * 100) <= 100
      ? "You sleep well and for a sufficient no. of hours.  if you feel refreshed and have good energy levels to begin the day then you know that your quality of sleep is great. "
      : Math.round((sleep / sleepTotal) * 100) >= 35 &&
        Math.round((sleep / sleepTotal) * 100) < 60
      ? "Getting sound sleep reduces your risk of developing certain chronic illnesses, keep your brain healthy, and boost your immune system. You need to improve your sleep routine for a more restful sleep. "
      : Math.round((sleep / sleepTotal) * 100) < 35
      ? "Lack of sleep leads to sleep deprivation, which in turn is responsible for a range of other health concern. You need quality support to make changes in your routine, diet, sleep comfort to improve your quality of sleep. "
      : "";
  var sleepRecommendation =
    Math.round((sleep / sleepTotal) * 100) >= 60 &&
    Math.round((sleep / sleepTotal) * 100) <= 100
      ? "You are such a sound sleeper !. We wish you the sweetest dreams and restful nights. "
      : Math.round((sleep / sleepTotal) * 100) >= 35 &&
        Math.round((sleep / sleepTotal) * 100) < 60
      ? "Include sleep inducing sources like almonds (28g), kiwi, chamomile tea, walnuts (handful), passionflower tea etc. to help improving the serotonin levels, helping in sleep quality.  "
      : Math.round((sleep / sleepTotal) * 100) < 35
      ? " Include sleep inducing sources like almonds (28g), kiwi, chamomile tea, walnuts (handful), passionflower tea etc. to help improving the serotonin levels, helping in sleep quality.  "
      : "";
  var sleepData =
    Math.round((sleep / sleepTotal) * 100) >= 60 &&
    Math.round((sleep / sleepTotal) * 100) <= 100
      ? "LOW"
      : Math.round((sleep / sleepTotal) * 100) >= 35 &&
        Math.round((sleep / sleepTotal) * 100) < 60
      ? "MEDIUM"
      : Math.round((sleep / sleepTotal) * 100) < 35
      ? "HIGH"
      : "";

  var bevergesReport =
    Math.round((beverges / bevergesTotal) * 100) >= 60 &&
    Math.round((beverges / bevergesTotal) * 100) <= 100
      ? "You do not have any problem with beverges. "
      : Math.round((beverges / bevergesTotal) * 100) >= 35 &&
        Math.round((beverges / bevergesTotal) * 100) < 60
      ? "Moderate consumption of beverges is a drink/ day for women and 2 drinks/ day for men. Please watch your consumption, various drinks have different % of beverges.  "
      : Math.round((beverges / bevergesTotal) * 100) < 35
      ? "Your consumption of beverges seems to be higher than normal moderate amount. Please note that beverges worsens health conditions related to issues.  "
      : "";
  var bevergesRecommendation =
    Math.round((beverges / bevergesTotal) * 100) >= 60 &&
    Math.round((beverges / bevergesTotal) * 100) <= 100
      ? "Keep up the good work for balancing your choices and living healthy!"
      : Math.round((beverges / bevergesTotal) * 100) >= 35 &&
        Math.round((beverges / bevergesTotal) * 100) < 60
      ? "Basic changes prior to reducing- Check beverges% and Carbohydrate content for the drinks & be mindful of your choice. "
      : Math.round((beverges / bevergesTotal) * 100) < 35
      ? "Basic changes prior to reducing- Check beverges% and Carbohydrate content for the drinks & be mindful of your choice.  "
      : "";
  var bevergesData =
    Math.round((beverges / bevergesTotal) * 100) >= 60 &&
    Math.round((beverges / bevergesTotal) * 100) <= 100
      ? "LOW"
      : Math.round((beverges / bevergesTotal) * 100) >= 35 &&
        Math.round((beverges / bevergesTotal) * 100) < 60
      ? "MEDIUM"
      : Math.round((beverges / bevergesTotal) * 100) < 35
      ? "HIGH"
      : "";

  var tobaccoReport =
    Math.round((tobacco / tobaccoTotal) * 100) >= 60 &&
    Math.round((tobacco / tobaccoTotal) * 100) <= 100
      ? "You don't smoke. Bravo!"
      : Math.round((tobacco / tobaccoTotal) * 100) >= 35 &&
        Math.round((tobacco / tobaccoTotal) * 100) < 60
      ? "Any exposure to tobacco is injurious to health. Cessation of smoking for more than 1 year reduces your risk and works towards building you respiratory health."
      : Math.round((tobacco / tobaccoTotal) * 100) < 35
      ? "Tobacco use is one of the most important preventable causes of premature death in the world. There is no question that limiting tobacco use is one of the most effective ways to save lives and improve overall well-being. Please quit smoking. "
      : "";

  var tobaccoRecommendation =
    Math.round((tobacco / tobaccoTotal) * 100) >= 60 &&
    Math.round((tobacco / tobaccoTotal) * 100) <= 100
      ? "Keep up the good habit of no smoking. If you are frequently exposed to passive smoking then do keep distance from smoke to avoid any risk to health. "
      : Math.round((tobacco / tobaccoTotal) * 100) >= 35 &&
        Math.round((tobacco / tobaccoTotal) * 100) < 60
      ? "Try ways and means how can you avoid the trigger to change the smoking habits. Start with chewing sugarless gum, raw carrots, celery, nuts or sunflower seeds "
      : Math.round((tobacco / tobaccoTotal) * 100) < 35
      ? "Try ways and means how can you avoid the trigger to change the smoking habits. Start with chewing sugarless gum, raw carrots, celery, nuts or sunflower seeds"
      : "";
  var tobaccoData =
    Math.round((tobacco / tobaccoTotal) * 100) >= 60 &&
    Math.round((tobacco / tobaccoTotal) * 100) <= 100
      ? "LOW"
      : Math.round((tobacco / tobaccoTotal) * 100) >= 35 &&
        Math.round((tobacco / tobaccoTotal) * 100) < 60
      ? "MEDIUM"
      : Math.round((tobacco / tobaccoTotal) * 100) < 35
      ? "HIGH"
      : "";

  var stressAndMentalWellbeingReport =
    Math.round(
      (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
    ) >= 60 &&
    Math.round(
      (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
    ) <= 100
      ? "You are in good control of your emotional and mental wellbeing. Your level of perceived stress is LOW, which means your mental and emotional wellbeing is at LOW risk of any stress related health concern.  "
      : Math.round(
          (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
        ) >= 35 &&
        Math.round(
          (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
        ) < 60
      ? "Your perceived stress is MODERATE. Which means, even though your level of stress is mostly within your threshold of tolerance, but there are occasions when you could feel emotionally unhappy or dissatisfied.  "
      : Math.round(
          (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
        ) < 35
      ? "Your perceived stress is HIGH. Which means you must seek support and practice activities for stress and anxiety reduction. With passing time, stress and anxiety grows chronic and may induce further risk of concerns like High blood pressure, insomnia and so on.  "
      : "";
  var stressAndMentalWellbeingRecommendation =
    Math.round(
      (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
    ) >= 60 &&
    Math.round(
      (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
    ) <= 100
      ? "Stay calm and focused. You are doing great !"
      : Math.round(
          (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
        ) >= 35 &&
        Math.round(
          (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
        ) < 60
      ? "Contemplate to add re-creational habit on a daily basis that can help you to unwind, learn and relax. For example- reading a book daily for 30 minutes OR  Walking clear-headedly for 30 minutes. These basic changes can often have a surprising impact on the way you feel.  "
      : Math.round(
          (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
        ) < 35
      ? "Communicate : Practice expression over suppression so that you do not bottle any level of stress with in you. Engage:A re-creational habit on a daily basis that can help you to unwind, learn and relax. For example- reading a book daily for 30 minutes OR  Walking clear-headedly for 30 minutes. "
      : "";
  var stressAndMentalWellbeingData =
    Math.round(
      (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
    ) >= 60 &&
    Math.round(
      (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
    ) <= 100
      ? "LOW"
      : Math.round(
          (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
        ) >= 35 &&
        Math.round(
          (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
        ) < 60
      ? "MEDIUM"
      : Math.round(
          (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
        ) < 35
      ? "HIGH"
      : "";

  let hra = `<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>

<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title></title>
  <link href="https://fonts.googleapis.com/css?family=Open Sans:400,400i,700,700i" rel="stylesheet">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
      integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
</head>

<body>
  <div class="container-fluid" style="font-family: revert;">

      <div>
          
          <div class="row">
              <div class="col-6" style="background-color:#a38ff7; padding: 25px 25px; align-content:center;">
                  <p style="margin-top: 10px;font-size: 25px;font-weight: 500;text-align: left;color: #fff;text-transform: uppercase;">Hygge Health Risk Assessment Report</p>
              </div>
              <div class="col-6" style="background-color:#a38ff7; padding: 25px 25px; align-content:center;">
                  <p style="margin-top: 10px;font-size: 25px;font-weight: 500;text-align: right;color: #fff;text-transform: uppercase;">${dateOfReport}</p>
              </div>
          </div>

          <div class="container-fluid">
              <div style="margin: 20px auto;">
  
                  <div class="row" style="background-color: #d5befd;padding: 10px;margin: 0px;">
                      <div class="col-7">
                          <p style=" margin-top: 10px;font-size: 30px;font-weight: 500;text-align: left;color: #fff;text-transform: uppercase;">${userName}</p>
                          <div style="font-size: 20px;font-weight: 500;color: #fff;">${userGender}, ${userAge} years </div>
                          <div style="font-size: 17px;margin-top: 10px;color: #fff;font-weight: 500;margin-bottom: 10px;">
                             This report highlight your health risks. your overall wellness score is ${totalHra}, which means that you need to immediately make some big changes in your food and lifestyle habits. 
                          </div>
                      </div>
                      <div class="col-5" style="align-self: center;">
                          <div style="background: #fff;border-radius: 50%;width: 180px;height: 180px;margin: auto;text-align: center;">
                              <p style="color: #ab7dfb;font-size: 37px;font-weight: bold;line-height: 180px;">${totalHra}%</p>
                          </div>
                      </div>
                  </div>
  
                  <div style="margin-top: 15px; margin-left:15px;">
                      <div class="row">
                          <div class="col-9">
                              <div class="row">
                                  <div class="col-9">
                                      <p style="margin-bottom:0px; color:#ab7dfb; font-size:22px;font-weight:bold;">${mind}/19 - ${mindData}</p>
                                      <div style="color:#929292;font-weight:bold;font-size:22px;">
                                          MY MIND SCORE
                                      </div>
                                  </div>
                                  <div class="col-3" style="text-align:right;">
                                      <img src="http://20.74.180.163:4000/1.png" style="height:80px;width:80px;">
                                  </div>
                              </div>
                              <div style="margin-top:15px;border:5px solid #e4f3fa;height:20px;background-color:#e4f3fa;"></div>
                              <div style="margin-top:15px;font-size:15px;color:#000;font-weight:500;">
                                  Your stress levels are becoming unmanageable and are affecting your daily life and productivity. Stress alone is a cause for multiple health complaints and you must quickly take steps to de-stress and relax. 
                              </div>
                              <div style="margin-top:20px;">
                                  <div class="row">
                                      <div class="col-9">
                                          <p style="margin-bottom:0px; color:#ab7dfb; font-size:22px;font-weight:bold;">${body}/51 - ${bodyData}</p>
                                          <div style="color:#929292;font-weight:bold;font-size:22px;">
                                              MY BODY SCORE
                                          </div>
                                      </div>
                                      <div class="col-3" style="text-align:right;">
                                          <img src="http://20.74.180.163:4000/2.png" style="height:80px;width:80px;">
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div class="col-3">
                              <div style="border:5px solid #e4f3fa; padding:15px; text-align: center;">
                                  <div style="font-size:18px;color:#38b6ff;font-weight:bold;">
                                      <p style="margin-bottom:0px;">HRA TOTAL SCORE</p>
                                      <div>HIGH: 80 to 100</div>
                                      <div>MEDIUM: 79 to 50</div>
                                      <div>LOW: 49 & BELOW</div>
                                  </div>
                                  <p style="margin-top:18px;font-size:13px;color:#38b6ff;font-weight:bold;margin-bottom:2px;">WHAT YOUR SCORES MEAN</p>
                                  <div style="font-size:13px;color:#a38ff7;font-weight:bold;">
                                      <div>HIGH: YOU'RE DOING GREAT MOST OF THE TIME</div>
                                      <div>MEDIUM: YOU COULD DO BETTER</div>
                                      <div>LOW: YOU NEED TO MAKE SOME DRASTIC CHANGES</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div style="margin-top:15px;border:5px solid #e4f3fa;height:20px;background-color:#e4f3fa;margin-bottom:15px;"></div>
                      <div class="row">
                          <div class="col-9">
                              <div style="margin-top:15px;font-size:15px;color:#000;font-weight:500;">
                                  Your overall score for physical health is low. This could be due to a
                                  number of reasons. Modifiable and non-modifiable health risk
                                  factors have been taken into account. The overall aggregate, based
                                  on your answers, highlights the need to work on modifiable factors
                                  in order to improve your body score.
                              </div>
                              <div style="margin-top:20px;">
                                  <div class="row">
                                      <div class="col-9">
                                          <p style="margin-bottom:0px; color:#ab7dfb; font-size:22px;font-weight:bold;">${lifestyle}/30 - ${lifestyleData}</p>
                                          <div style="color:#929292;font-weight:bold;font-size:22px;">
                                              MY LIFESTYLE SCORE
                                          </div>
                                      </div>
                                      <div class="col-3" style="text-align:right;">
                                          <img src="http://20.74.180.163:4000/3.png" style="height:80px;width:80px;">
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div class="col-3">
                              <div style="border:5px solid #e4f3fa; padding:15px; text-align: center;">
                                  <div style="font-size:18px;color:#38b6ff;font-weight:bold;">
                                      <p style="margin-bottom:0px;">MIND SCORE</p>
                                      <div>HIGH: 11-19</div>
                                      <div>MEDIUM: 6-10</div>
                                      <div>LOW: 6 & BELOW</div>
                                  </div>
                                  <div style="margin-top:15px;font-size:18px;color:#38b6ff;font-weight:bold;">
                                      <p style="margin-bottom:0px;">BODY SCORE</p>
                                      <div>HIGH: 35-51</div>
                                      <div>MEDIUM: 18-34</div>
                                      <div>LOW: 18 & BELOW</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div style="margin-top:15px;border:5px solid #e4f3fa;height:20px;background-color:#e4f3fa;margin-bottom:15px;"></div>
                      <div class="row">
                          <div class="col-9">
                              <div style="margin-top:15px;font-size:15px;color:#000;font-weight:500;">
                                  This includes an assessment of the modifiable factors
                                  responsible for lifestyle-related health concerns. The overall
                                  aggregate of your responses reveals that you need to make
                                  mindful changes in certain lifestyle habits related to hydration,
                                  physical activity, nutrition, sleep and stress. This will definitely
                                  improve your health over a period of time
                              </div>
                          </div>
                          <div class="col-3">
                              <div style="border:5px solid #e4f3fa; padding:15px; text-align: center;">
                                  <div style="font-size:18px;color:#38b6ff;font-weight:bold;">
                                      <p style="margin-bottom:0px;">LIFESTYLE SCORE</p>
                                      <div>HIGH: 20-30</div>
                                      <div>MEDIUM: 10-20</div>
                                      <div>LOW: 10 & BELOW</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <p style="margin-top:15px; color:#38b9ff;font-weight:bold;text-align:center">TO IMPROVE YOUR SCORES, CHECK OUT OUR REC OMMENDATIONS IN THE REPORT.</p>
                      <div style="border-top: 10px solid hsl(198deg 88% 81%);margin-top: 20px;">
                          <div style="background-color: hsl(199deg 88% 80%);width: 10%;text-align: center;font-size: 22px;color: #fff;padding-bottom: 5px;font-weight: bold;border: 1px solid hsl(199deg 88% 80%);">
                              <p style="margin-bottom: 10px;">01</p>
                          </div>
                      </div>
                  </div>
              
              </div>
          </div>

      </div>

      <div>

          <div class="row">
              <div class="col-6" style="background-color:#a38ff7; padding: 25px 25px; align-content:center;">
                  <p style="margin-top: 10px;font-size: 25px;font-weight: 500;text-align: left;color: #fff;text-transform: uppercase;">Hygge Health Risk Assessment Report</p>
              </div>
              <div class="col-6" style="background-color:#a38ff7; padding: 25px 25px; align-content:center;">
                  <p style=" margin-top: 10px;font-size: 25px;font-weight: 500;text-align: right;color: #fff;text-transform: uppercase;">${userName}</p>
              </div>
          </div>
  
          <div class="container-fluid">
              <div style="margin: 20px auto;">
  
                  <div class="row" style="background-color: #d5befd;padding: 10px;margin: 0px;">
                      <div class="col-7">
                          <p style=" margin-top: 10px;font-size: 30px;font-weight: 500;text-align: left;color: #fff;text-transform: uppercase;">My Body</p>
                          <div style=" font-size: 20px;font-weight: 500;color: #fff; font-style:italic">An analysis of your PHYSICAL HEALTH</div>
                          <div style="font-size: 16px;margin-top: 10px;color: #fff;font-weight: 500;margin-bottom: 10px;">
                              Your overall body score is ${body}. This is low which means that you need to make significant
                              changes in
                              your daily habits.
                          </div>
                      </div>
                      <div class="col-5" style="align-self: center;">
                          <div style="background: #fff;border-radius: 50%;width: 180px;height: 180px;margin: auto;text-align: center;">
                              <p style="color: #ab7dfb;font-size: 37px;font-weight: bold;line-height: 180px;">${body}/51</p>
                          </div>
                      </div>
                  </div>
  
                  <div style="padding: 0px 15px;">
                      <div class="row" style="border: 3px solid hsl(198deg 88% 81%);">
                          <div class="col-6" style="border-right: 3px solid hsl(198deg 88% 81%);">
                              <div class="row">
                                  <div class="col-9">
                                      <div style="font-size: 20px;font-weight: bold;text-decoration: underline;color: #6863FF;margin-top: 10px;">
                                          PERSONAL - ${personalData}
                                      </div>
                                      <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                          <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                              ${personalReport}
                                          </span>
                                      </div>
                                  </div>
                                  <div class="col-3" style="text-align:center;align-self:center;">
                                      <!-- <img src="http://20.74.180.163:4000/4.png" style="height:80px;width:80px;"> -->
                                  </div>
                              </div>
                          </div>
                          <div class="col-6">
                              <div class="row">
                                  <div class="col-9">
                                      <div style="font-size: 20px;font-weight: bold;text-decoration: underline;color: #6863FF;margin-top: 10px;">
                                          CLINICAL HISTORY - ${clinicalHistoryData}
                                      </div>
                                      <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                          <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                              ${clinicalHistoryReport}
                                          </span>
                                      </div>
                                  </div>
                                  <div class="col-3" style="text-align:center;align-self:center;">
                                      <!-- <img src="http://20.74.180.163:4000/4.png" style="height:80px;width:80px;"> -->
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div class="row" style="border-bottom: 3px solid hsl(198deg 88% 81%);border-left: 3px solid hsl(198deg 88% 81%);border-right: 3px solid hsl(198deg 88% 81%);">
                          <div class="col-6" style="border-right: 3px solid hsl(198deg 88% 81%);">
                              <div class="row">
                                  <div class="col-9">
                                      <div style="font-size: 20px;font-weight: bold;text-decoration: underline;color: #6863FF;margin-top: 10px;">
                                          FAMILY HISTORY - ${familyHistoryData}
                                      </div>
                                      <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                          <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                              ${familyHistoryReport}
                                          </span>
                                      </div>
                                  </div>
                                  <div class="col-3" style="text-align:center;align-self:center;">
                                      <!-- <img src="http://20.74.180.163:4000/4.png" style="height:80px;width:80px;"> -->
                                  </div>
                              </div>
                          </div>
                          <div class="col-6">
                              <div class="row">
                                  <div class="col-9">
                                      <div style="font-size: 20px;font-weight: bold;text-decoration: underline;color: #6863FF;margin-top: 10px;">
                                          BIOMETRICS - ${BiometricsData}
                                      </div>
                                      <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                          <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                              ${BiometricsReport}
                                          </span>
                                      </div>
                                  </div>
                                  <div class="col-3" style="text-align:center;align-self:center;">
                                      <img src="http://20.74.180.163:4000/10.png" style="height:80px;width:80px;">
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div class="row" style="border-bottom: 3px solid hsl(198deg 88% 81%);border-left: 3px solid hsl(198deg 88% 81%);border-right: 3px solid hsl(198deg 88% 81%);">
                          <div class="col-6" style="border-right: 3px solid hsl(198deg 88% 81%);">
                              <div class="row">
                                  <div class="col-9">
                                      <div style="font-size: 20px;font-weight: bold;text-decoration: underline;color: #6863FF;margin-top: 10px;">
                                          SCREENING - ${screeningData}
                                      </div>
                                      <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                          <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                              ${screeningReport}
                                          </span>
                                      </div>
                                  </div>
                                  <div class="col-3" style="text-align:center;align-self:center;">
                                      <!-- <img src="http://20.74.180.163:4000/4.png" style="height:80px;width:80px;"> -->
                                  </div>
                              </div>
                          </div>
                          <div class="col-6">
                              <div class="row">
                                  <div class="col-9">
                                      <div style="font-size: 20px;font-weight: bold;text-decoration: underline;color: #6863FF;margin-top: 10px;">
                                          OCCUPATIONAL HISTORY - ${occupationalHistoryData}
                                      </div>
                                      <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                          <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                              ${occupationalHistoryReport}
                                          </span>
                                      </div>
                                  </div>
                                  <div class="col-3" style="text-align:center;align-self:center;">
                                      <img src="http://20.74.180.163:4000/11.png" style="height:80px;width:80px;">
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div class="row" style="border-bottom: 3px solid hsl(198deg 88% 81%);border-left: 3px solid hsl(198deg 88% 81%);border-right: 3px solid hsl(198deg 88% 81%);">
                          <div class="col-10">
                              <div style="font-size: 20px;font-weight: bold;color:#6863FF;margin-top:10px;">
                                  RECOMMENDATIONS
                              </div>
                              <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                  <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                      1. ${personalRecommendation}
                                      <br />
                                      2. ${clinicalHistoryRecommendation}
                                      <br />
                                      3. ${familyHistoryRecommendation}
                                      <br />
                                      4. ${BiometricsRecommendation}
                                      <br />
                                      5. ${occupationalHistoryRecommendation}
                                  </span>
                              </div>
                          </div>
                          <div class="col-2" style="text-align:center;align-self:center;">
                              <img src="http://20.74.180.163:4000/7.png" style="height:100px;width:100px;">
                          </div>
                      </div>

                  </div>
  
                  <div style="border-top: 10px solid hsl(198deg 88% 81%);margin-top: 20px;">
                      <div style="background-color: hsl(199deg 88% 80%);width: 10%;text-align: center;font-size: 22px;color: #fff;padding-bottom: 5px;font-weight: bold;border: 1px solid hsl(199deg 88% 80%);">
                          <p style="margin-bottom: 10px;">02</p>
                      </div>
                  </div>
  
              </div>
          </div>

      </div>

      <div>

          <div class="row">
              <div class="col-6" style="background-color:#a38ff7; padding: 25px 25px; align-content:center;">
                  <p style="margin-top: 10px;font-size: 25px;font-weight: 500;text-align: left;color: #fff;text-transform: uppercase;">Hygge Health Risk Assessment Report</p>
              </div>
              <div class="col-6" style="background-color:#a38ff7; padding: 25px 25px; align-content:center;">
                  <p style=" margin-top: 10px;font-size: 25px;font-weight: 500;text-align: right;color: #fff;text-transform: uppercase;">${userName}</p>
              </div>
          </div>
  
          <div class="container-fluid">
              <div style="margin: 20px auto;">
  
                  <div class="row" style="background-color: #d5befd;padding: 10px;margin: 0px;">
                      <div class="col-7">
                          <p style=" margin-top: 10px;font-size: 30px;font-weight: 500;text-align: left;color: #fff;text-transform: uppercase;">My Lifestyle</p>
                          <div style=" font-size: 20px;font-weight: 500;color: #fff; font-style:italic">An analysis of your DAILY HAB</div>
                          <div style="font-size: 16px;margin-top: 10px;color: #fff;font-weight: 500;margin-bottom: 10px;">
                              Your overall lifestyle score is ${lifestyle}. This is low which means that you need to modify your habits related to diet, physical acitivity, hydration, sleep and stress.
                          </div>
                      </div>
                      <div class="col-5" style="align-self: center;">
                          <div style="background: #fff;border-radius: 50%;width: 180px;height: 180px;margin: auto;text-align: center;">
                              <p style="color: #ab7dfb;font-size: 37px;font-weight: bold;line-height: 180px;">${lifestyle}/30</p>
                          </div>
                      </div>
                  </div>
  
                  <div style="padding: 0px 15px;">
                      <div class="row" style="border: 3px solid hsl(198deg 88% 81%);">
                          <div class="col-6" style="border-right: 3px solid hsl(198deg 88% 81%);">
                              <div class="row">
                                  <div class="col-9">
                                      <div style="font-size: 20px;font-weight: bold;text-decoration: underline;color: #6863FF;margin-top: 10px;">
                                          DIET - ${dietData}
                                      </div>
                                      <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                          <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                              ${dietReport}
                                          </span>
                                      </div>
                                  </div>
                                  <div class="col-3" style="text-align:center;align-self:center;">
                                      <img src="http://20.74.180.163:4000/12.png" style="height:80px;width:80px;">
                                  </div>
                              </div>
                          </div>
                          <div class="col-6">
                              <div class="row">
                                  <div class="col-9">
                                      <div style="font-size: 20px;font-weight: bold;text-decoration: underline;color: #6863FF;margin-top: 10px;">
                                          SLEEP - ${sleepData}
                                      </div>
                                      <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                          <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                              ${sleepReport}
                                          </span>
                                      </div>
                                  </div>
                                  <div class="col-3" style="text-align:center;align-self:center;">
                                      <img src="http://20.74.180.163:4000/14.png" style="height:80px;width:80px;">
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div class="row" style="border-bottom: 3px solid hsl(198deg 88% 81%);border-left: 3px solid hsl(198deg 88% 81%);border-right: 3px solid hsl(198deg 88% 81%);">
                          <div class="col-6" style="border-right: 3px solid hsl(198deg 88% 81%);">
                              <div class="row">
                                  <div class="col-9">
                                      <div style="font-size: 20px;font-weight: bold;text-decoration: underline;color: #6863FF;margin-top: 10px;">
                                          BEVERAGES - ${bevergesData}
                                      </div>
                                      <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                          <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                              ${bevergesReport}
                                          </span>
                                      </div>
                                  </div>
                                  <div class="col-3" style="text-align:center;align-self:center;">
                                      <img src="http://20.74.180.163:4000/15.png" style="height:80px;width:80px;">
                                  </div>
                              </div>
                          </div>
                          <div class="col-6">
                              <div class="row">
                                  <div class="col-9">
                                      <div style="font-size: 20px;font-weight: bold;text-decoration: underline;color: #6863FF;margin-top: 10px;">
                                          PHYSICAL ACTIVITY - ${physicalActivityData}
                                      </div>
                                      <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                          <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                              ${physicalActivityReport}
                                          </span>
                                      </div>
                                  </div>
                                  <div class="col-3" style="text-align:center;align-self:center;">
                                      <img src="http://20.74.180.163:4000/13.png" style="height:80px;width:80px;">
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div class="row" style="border-bottom: 3px solid hsl(198deg 88% 81%);border-left: 3px solid hsl(198deg 88% 81%);border-right: 3px solid hsl(198deg 88% 81%);">
                          <div class="col-6" style="border-right: 3px solid hsl(198deg 88% 81%);">
                              <div class="row">
                                  <div class="col-9">
                                      <div style="font-size: 20px;font-weight: bold;text-decoration: underline;color: #6863FF;margin-top: 10px;">
                                          TOBACCO - ${tobaccoData}
                                      </div>
                                      <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                          <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                              ${tobaccoReport}
                                          </span>
                                      </div>
                                  </div>
                                  <div class="col-3" style="text-align:center;align-self:center;">
                                      <img src="http://20.74.180.163:4000/18.png" style="height:80px;width:80px;">
                                  </div>
                              </div>
                          </div>
                          <div class="col-6">
                          </div>
                      </div>
                      <div class="row" style="border-bottom: 3px solid hsl(198deg 88% 81%);border-left: 3px solid hsl(198deg 88% 81%);border-right: 3px solid hsl(198deg 88% 81%);">
                          <div class="col-10">
                              <div style="font-size: 20px;font-weight: bold;color:#6863FF;margin-top:10px;">
                                  RECOMMENDATIONS
                              </div>
                              <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                  <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                      1. ${dietRecommendation}
                                      <br />
                                      2. ${sleepRecommendation}
                                      <br />
                                      3. ${bevergesRecommendation}
                                      <br />
                                      4. ${physicalActivityRecommendation}
                                      <br />
                                      5. ${tobaccoRecommendation}
                                  </span>
                              </div>
                          </div>
                          <div class="col-2" style="text-align:center;align-self:center;">
                              <img src="http://20.74.180.163:4000/7.png" style="height:100px;width:100px;">
                          </div>
                      </div>

                  </div>
  
                  <div style="border-top: 10px solid hsl(198deg 88% 81%);margin-top: 20px;">
                      <div style="background-color: hsl(199deg 88% 80%);width: 10%;text-align: center;font-size: 22px;color: #fff;padding-bottom: 5px;font-weight: bold;border: 1px solid hsl(199deg 88% 80%);">
                          <p style="margin-bottom: 10px;">03</p>
                      </div>
                  </div>
  
              </div>
          </div>

      </div>

      <div>

          <div class="row">
              <div class="col-6" style="background-color:#a38ff7; padding: 25px 25px; align-content:center;">
                  <p style="margin-top: 10px;font-size: 25px;font-weight: 500;text-align: left;color: #fff;text-transform: uppercase;">Hygge Health Risk Assessment Report</p>
              </div>
              <div class="col-6" style="background-color:#a38ff7; padding: 25px 25px; align-content:center;">
                  <p style=" margin-top: 10px;font-size: 25px;font-weight: 500;text-align: right;color: #fff;text-transform: uppercase;">${userName}</p>
              </div>
          </div>
  
          <div class="container-fluid">
              <div style="margin: 20px auto;">
  
                  <div class="row" style="background-color: #d5befd;padding: 10px;margin: 0px;">
                      <div class="col-7">
                          <p style=" margin-top: 10px;font-size: 30px;font-weight: 500;text-align: left;color: #fff;text-transform: uppercase;">My Mind</p>
                          <div style=" font-size: 20px;font-weight: 500;color: #fff; font-style:italic">An analysis of your MENTAL HEALTH</div>
                          <div style="font-size: 16px;margin-top: 10px;color: #fff;font-weight: 500;margin-bottom: 10px;">
                              Your overall mind score is ${mind}. This is okay but need to modify some behaviors and habits in order to achieve greater clarity and focus, and release stress.
                          </div>
                      </div>
                      <div class="col-5" style="align-self: center;">
                          <div style="background: #fff;border-radius: 50%;width: 180px;height: 180px;margin: auto;text-align: center;">
                              <p style="color: #ab7dfb;font-size: 37px;font-weight: bold;line-height: 180px;">${mind}/19</p>
                          </div>
                      </div>
                  </div>
  
                  <div style="padding: 0px 15px;">
                      <div class="row" style="border: 3px solid hsl(198deg 88% 81%);">
                          <div class="col-6" style="border-right: 3px solid hsl(198deg 88% 81%);">
                              <div class="row">
                                  <div class="col-9">
                                      <div style="font-size: 20px;font-weight: bold;text-decoration: underline;color: #6863FF;margin-top: 10px;">
                                          STRESS LEVEL - ${stressAndMentalWellbeingData}
                                      </div>
                                      <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                          <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                              ${stressAndMentalWellbeingReport}
                                          </span>
                                      </div>
                                  </div>
                                  <div class="col-3" style="text-align:center;align-self:center;">
                                      <img src="http://20.74.180.163:4000/8.png" style="height:80px;width:80px;">
                                  </div>
                              </div>
                          </div>
                          <div class="col-6">
                              <div class="row">
                                  <div class="col-9">
                                      <div style="font-size: 20px;font-weight: bold;text-decoration: underline;color: #6863FF;margin-top: 10px;">
                                          
                                      </div>
                                      <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                          <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                              
                                          </span>
                                      </div>
                                  </div>
                                  <div class="col-3" style="text-align:center;align-self:center;">
                                      
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div class="row" style="border-bottom: 3px solid hsl(198deg 88% 81%);border-left: 3px solid hsl(198deg 88% 81%);border-right: 3px solid hsl(198deg 88% 81%);">
                          <div class="col-10">
                              <div style="font-size: 20px;font-weight: bold;color:#6863FF;margin-top:10px;">
                                  RECOMMENDATIONS
                              </div>
                              <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                  <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                      1. ${stressAndMentalWellbeingRecommendation}
                                      <br />
                                  </span>
                              </div>
                          </div>
                          <div class="col-2" style="text-align:center;align-self:center;">
                              <img src="http://20.74.180.163:4000/7.png" style="height:100px;width:100px;">
                          </div>
                      </div>
                      <div class="row" style="border: 3px solid hsl(198deg 88% 81%);">
                          <div class="col-12">
                              <div style="font-size: 20px;font-weight: bold;color:#000;margin-top:10px;">
                                  Disclaimer                                </div>
                              <div style=" font-size: 16px;font-weight: bold;margin-top: 10px;color: #000;margin-bottom:10px;">
                                  <span style="font-size: 14px;font-weight: 500;margin-top: 10px;color: #000;text-decoration: none;">
                                      This report has been prepared just for you to help analyze your current health condition and behaviors. The information contained in
                                      this report will help guide you towards better health. This report is not meant to take the place of a visit to the doctor nor can it
                                      diagnose any illness or medical problems. It is designed to give you information relating to your health risks and overall wellbeing.
                                      This information is provided to help you develop a plan of action and make healthy changes in your lifestyle.
                                  </span>
                              </div>
                          </div>
                      </div>

                  </div>
  
                  <div style="border-top: 10px solid hsl(198deg 88% 81%);margin-top: 20px;">
                      <div style="background-color: hsl(199deg 88% 80%);width: 10%;text-align: center;font-size: 22px;color: #fff;padding-bottom: 5px;font-weight: bold;border: 1px solid hsl(199deg 88% 80%);">
                          <p style="margin-bottom: 10px;">04</p>
                      </div>
                  </div>
  
              </div>
          </div>

      </div>

  </div>
</body>

</html>`;
  return hra;
};

//----------------------------------old dynamic html templete ----------------------------------------------------

// <!DOCTYPE html
//     PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
// <html>

// <head>
//     <meta charset="UTF-8">
//     <meta content="width=device-width, initial-scale=1" name="viewport">
//     <meta name="x-apple-disable-message-reformatting">
//     <meta http-equiv="X-UA-Compatible" content="IE=edge">
//     <meta content="telephone=no" name="format-detection">
//     <title></title>
//     <link href="https://fonts.googleapis.com/css?family=Open Sans:400,400i,700,700i" rel="stylesheet">
//     <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
//         integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
//     <style>
//         .head_text_1 {
//             margin-top: 10px;
//             font-size: 25px;
//             font-weight: 500;
//             text-align: left;
//             color: #fff;
//             text-transform: uppercase;
//         }

//         .head_text_2 {
//             margin-top: 10px;
//             font-size: 25px;
//             font-weight: 500;
//             text-align: right;
//             color: #fff;
//             text-transform: uppercase;
//         }

//         .report_type_head {
//             margin-top: 10px;
//             font-size: 30px;
//             font-weight: 500;
//             text-align: left;
//             color: #fff;
//             text-transform: uppercase;
//         }

//         .main_div {
//             margin: 20px auto;
//         }

//         .inner_content {
//             background-color: hsl(196deg 37% 76%);
//             padding: 10px;
//             margin: 0px;
//         }

//         .main_head_text {
//             font-size: 22px;
//             font-weight: 500;
//             color: #fff;
//         }

//         .main_subHead_Text {
//             font-size: 20px;
//             margin-top: 10px;
//             color: #fff;
//             font-weight: 500;
//             margin-bottom: 10px;
//         }

//         .score_content {
//             background: #fff;
//             border-radius: 50%;
//             width: 180px;
//             height: 180px;
//             margin: auto;
//             text-align: center;
//         }

//         .score_card {
//             color: hsl(196deg 37% 51%);
//             font-size: 30px;
//             font-weight: bold;
//             line-height: 180px;
//         }

//         .all_content_report {
//             border: 3px solid hsl(198deg 88% 81%);
//             padding: 12px;
//         }

//         .inner_sub_head {
//             font-size: 20px;
//             font-weight: bold;
//             text-decoration: underline;
//             color: #6863FF;
//             margin-top: 10px;
//         }

//         .innner_content_head {
//             font-size: 18px;
//             font-weight: bold;
//             text-decoration: underline;
//             color: #000;
//             margin-top: 10px;
//         }

//         .inner_div {
//             margin-left: 0px;
//         }

//         .innner_report_text_style {
//             font-size: 16px;
//             font-weight: bold;
//             margin-top: 10px;
//             color: #000;
//         }

//         .innner_report_content_text {
//             font-size: 14px;
//             font-weight: 500;
//             margin-top: 10px;
//             color: #000;
//             text-decoration: none;
//             margin-left: 5px;
//         }

//         .row_style {
//             background-color: hsl(199deg 88% 80%);
//             align-content: center;
//             padding: 25px 25px;
//         }

//         .footer_style {
//             border-top: 10px solid hsl(198deg 88% 81%);
//             margin-top: 20px;
//         }

//         .fonnet_inner_style {
//             background-color: hsl(199deg 88% 80%);
//             width: 10%;
//             text-align: center;
//             font-size: 22px;
//             color: #fff;
//             padding-bottom: 5px;
//             font-weight: bold;
//             border: 1px solid hsl(199deg 88% 80%);
//         }

//         @media only screen and (max-width: 768px) {

//             /* For mobile phones: */
//             .score_content {
//                 background: #fff;
//                 border-radius: 50%;
//                 width: 90px;
//                 height: 90px;
//                 margin: auto;
//                 text-align: center;
//             }

//             .score_card {
//                 color: hsl(196deg 37% 51%);
//                 font-size: 30px;
//                 font-weight: bold;
//                 line-height: 90px;
//             }

//             .fonnet_inner_style {
//                 background-color: hsl(199deg 88% 80%);
//                 border: 1px solid hsl(199deg 88% 80%);
//                 width: 20%;
//                 text-align: center;
//                 font-size: 22px;
//                 color: #fff;
//                 padding-bottom: 5px;
//                 font-weight: bold;
//             }
//         }
//     </style>
// </head>

// <body>
//     <div class="container-fluid" style="font-family: revert;">

//         <div class="row row_style">
//             <div class="col-6">
//                 <p class="head_text_1" style="color:green;">Hygge Health Risk Assessment Report</p>
//             </div>
//             <div class="col-6">
//                 <p class="head_text_2">David Scott</p>
//             </div>
//         </div>

//         <div class="container-fluid">
//             <div class="main_div">

//                 <div class="row inner_content">
//                     <div class="col-7">
//                         <p class="report_type_head">My Body</p>
//                         <div class="main_head_text">An analysis of your PHYSICAL HEALTH</div>
//                         <div class="main_subHead_Text">
//                             Your overall body score is ${body}. ${bodyReport}
//                         </div>
//                     </div>
//                     <div class="col-5" style="align-self: center;">
//                         <div class="score_content">
//                             <p class="score_card">${body}/51</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div class="all_content_report">
//                     <div class="inner_sub_head">
//                         PERSONAL
//                     </div>
//                     <div class="inner_div">
//                         <div class="innner_content_head">
//                             Age -
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${personalReport}
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${personalRecommendation}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                     <div class="inner_sub_head">
//                         CLINICAL HISTORY
//                     </div>
//                     <div class="inner_div">
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${clinicalHistoryReport}
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${clinicalHistoryRecommendation}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                     <div class="inner_sub_head">
//                         FAMILY HISTORY
//                     </div>
//                     <div class="inner_div">
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${familyHistoryReport}
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${familyHistoryRecommendation}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                     <div class="inner_sub_head">
//                         BIOMETRICS
//                     </div>
//                     <div class="inner_div">
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${BiometricsReport}
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${BiometricsRecommendation}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                     <div class="inner_sub_head">
//                         SCREENING
//                     </div>
//                     <div class="inner_div">
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${screeningReport}
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${screeningRecommendation}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                     <div class="inner_sub_head">
//                         OCCUPATIONAL HISTORY
//                     </div>
//                     <div class="inner_div">
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${occupationalHistoryReport}
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${occupationalHistoryRecommendation}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div class="footer_style">
//                     <div class="fonnet_inner_style">
//                         <p style="margin-bottom: 10px;">02</p>
//                     </div>
//                 </div>

//             </div>
//         </div>

//         <div class="container-fluid">
//             <div class="main_div">

//                 <div class="row inner_content">
//                     <div class="col-7">
//                         <p class="report_type_head">My Lifestyle</p>
//                         <div class="main_head_text">An analysis of your DAILY HAB</div>
//                         <div class="main_subHead_Text">
//                             . Your overall lifestyle score is ${lifestyle} .${lifestyleReport}.
//                         </div>
//                     </div>
//                     <div class="col-5" style="align-self: center;">
//                         <div class="score_content">
//                             <p class="score_card">${lifestyle}/30</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div class="all_content_report">
//                     <div class="inner_sub_head">
//                         DIET-LOW
//                     </div>
//                     <div class="inner_div">
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${dietReport}
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${dietRecommendation}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                     <div class="inner_sub_head">
//                         SLEEP - LOW
//                     </div>
//                     <div class="inner_div">
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${sleepReport}
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${sleepRecommendation}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                     <div class="inner_sub_head">
//                         beverges - LOW
//                     </div>
//                     <div class="inner_div">
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${bevergesReport}
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${bevergesRecommendation}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                     <div class="inner_sub_head">
//                         PHYSICAL ACTIVITY - LOW
//                     </div>
//                     <div class="inner_div">
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${physicalActivityReport}
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${physicalActivityRecommendation}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                     <div class="inner_sub_head">
//                         TOBACCO - LOW
//                     </div>
//                     <div class="inner_div">
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     Age is on your side, pick right habits early on. There has been a rise in
//                                     obesity
//                                     and
//                                     also
//                                     metabolic complaints for young adults too. Let us create a new wave of ‘healthy
//                                     YOUth’
//                                     by
//                                     being ultra mindful everyday!
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     Age is on your side, pick right habits early on. There has been a rise in
//                                     obesity
//                                     and
//                                     also
//                                     metabolic complaints for young adults too. Let us create a new wave of ‘healthy
//                                     YOUth’
//                                     by
//                                     being ultra mindful everyday!
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                     <div class="inner_sub_head">
//                         BEVERAGES - LOW
//                     </div>
//                     <div class="inner_div">
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     Age is on your side, pick right habits early on. There has been a rise in
//                                     obesity
//                                     and
//                                     also
//                                     metabolic complaints for young adults too. Let us create a new wave of ‘healthy
//                                     YOUth’
//                                     by
//                                     being ultra mindful everyday!
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     Age is on your side, pick right habits early on. There has been a rise in
//                                     obesity
//                                     and
//                                     also
//                                     metabolic complaints for young adults too. Let us create a new wave of ‘healthy
//                                     YOUth’
//                                     by
//                                     being ultra mindful everyday!
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div class="footer_style">
//                     <div class="fonnet_inner_style">
//                         <p style="margin-bottom: 10px;">02</p>
//                     </div>
//                 </div>

//             </div>
//         </div>

//         <div class="container-fluid">
//             <div class="main_div">

//                 <div class="row inner_content">
//                     <div class="col-7">
//                         <p class="report_type_head">My Mind</p>
//                         <div class="main_head_text">An analysis of your MENTAL HEALTH</div>
//                         <div class="main_subHead_Text">
//                             Your overall mind score is ${mind} . ${mindReport}.
//                         </div>
//                     </div>
//                     <div class="col-5" style="align-self: center;">
//                         <div class="score_content">
//                             <p class="score_card">${mind}/20</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div class="all_content_report">
//                     <div class="inner_sub_head">
//                         STRESS LEVEL
//                     </div>
//                     <div class="inner_div">
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${stressAndMentalWellbeingReport}
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     ${stressAndMentalWellbeingRecommendation}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                     <div class="inner_sub_head">
//                         SOCIO-PSYCHOLOGICAL WELL-BEING
//                     </div>
//                     <div class="inner_div">
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     Age is on your side, pick right habits early on. There has been a rise in
//                                     obesity
//                                     and
//                                     also
//                                     metabolic complaints for young adults too. Let us create a new wave of ‘healthy
//                                     YOUth’
//                                     by
//                                     being ultra mindful everyday!
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     Age is on your side, pick right habits early on. There has been a rise in
//                                     obesity
//                                     and
//                                     also
//                                     metabolic complaints for young adults too. Let us create a new wave of ‘healthy
//                                     YOUth’
//                                     by
//                                     being ultra mindful everyday!
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                     <div class="inner_sub_head">
//                         MOTIVATION & PRODUCTIVITY
//                     </div>
//                     <div class="inner_div">
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Report:-</span>
//                                 <span class="innner_report_content_text">
//                                     Age is on your side, pick right habits early on. There has been a rise in
//                                     obesity
//                                     and
//                                     also
//                                     metabolic complaints for young adults too. Let us create a new wave of ‘healthy
//                                     YOUth’
//                                     by
//                                     being ultra mindful everyday!
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <div class="innner_report_text_style">
//                                 <span style="text-decoration: underline;">Recommendation:-</span>
//                                 <span class="innner_report_content_text">
//                                     Age is on your side, pick right habits early on. There has been a rise in
//                                     obesity
//                                     and
//                                     also
//                                     metabolic complaints for young adults too. Let us create a new wave of ‘healthy
//                                     YOUth’
//                                     by
//                                     being ultra mindful everyday!
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div class="footer_style">
//                     <div class="fonnet_inner_style">
//                         <p style="margin-bottom: 10px;">02</p>
//                     </div>
//                 </div>

//             </div>
//         </div>

//     </div>
// </body>

// </html>`
