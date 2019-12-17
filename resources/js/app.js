let app = angular.module('Kariertabelo', []);

app.controller('KariertabeloCtrl', function($scope) {
  
  $scope.titles = {
    education:"Educación",
    languages:"Idiomas",
    interests:"Intereses"
  };

  $scope.data = {
    profile:{
      name:"Francisco Gil",
      position:"IT Project Manager",
      location:"San Antonio"
    },
    bio:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    contact:{
      email:"gil.franfer@gmail.com",
      phone:"+1 2104195536",
      webpage:"gillab.netlify.com",
      github:"github.com/gilfranfer",
      linkedin:"linkedin.com/in/gilfranfer/",
      twitter:"",
      facebook:"",
      instagram:""
      /*,whatsapp:"",snapchat:""*/
    },
    education:[
      {orderId:1, degree:"Master in IT Management", school:"IEU Puebla", period:"2017 - 2019"},
      {orderId:2, degree:"Software Engineering", school:"ITS Xalapa", period:"2008 - 2012"}
    ],
    languages:[
      {orderId:1, language:"Spanish", level:"Native"},
      {orderId:2, language:"English", level:"Advanced"}
    ],
    interests:[
      {orderId:1, interest:"Photography", level:"Native"},
      {orderId:2, interest:"Coding", level:"Advanced"},
      {orderId:3, interest:"Traveling", level:"Advanced"}
    ]
  };

});
