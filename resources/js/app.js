let app = angular.module('Kariertabelo', []);

app.controller('KariertabeloCtrl', function($scope) {

  $scope.titles = {
    education:"Educación",
    languages:"Idiomas",
    interests:"Intereses",
    summary:"Resumen de Carrera",
    work:"Experiencia Laboral",
    projects:"Proyectos Personales",
    skills:"Habilidades y Conocimientos"
  };

  /* recordId is used to order the entries. Order is from larger to smaller number, and IDs must not be repeated */
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
      {recordId:2, degree:"Master in IT Management", school:"IEU Puebla", period:"2017 - 2019"},
      {recordId:1, degree:"Software Engineering", school:"ITS Xalapa", period:"2008 - 2012"}
    ],
    languages:[
      {recordId:2, language:"Spanish", level:"Native"},
      {recordId:1, language:"English", level:"Advanced"}
    ],
    interests:[
      {recordId:1, interest:"Photography", level:"Native"},
      {recordId:2, interest:"Coding", level:"Advanced"},
      {recordId:3, interest:"Traveling", level:"Advanced"}
    ],
    resume:{
      summary:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      work:[
        {recordId:1, role:"Software Developer", employer:"Softtek", location:"", period:"Agosto 2011 - Junio 2014", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
        {recordId:2, role:"Technical Lead", employer:"TCS America", location:"", period:"Junio 2014 - Marzo 2017", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
        {recordId:3, role:"IT Manager", employer:"TCS America", location:"", period:"Abril 2017 - Presente", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
      ],
      projects:[
        {recordId:1, name:"Okulus", url:"http://okulus.netlify.com", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
        {recordId:2, name:"Kariertabelo", url:"http://Kariertabelo.netlify.com", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
      ],
      skillsBar:[
        {recordId:1, skill:"Python", level:70},
        {recordId:2, skill:"Kotlin", level:50},
        {recordId:3, skill:"JavaScript", level:75},
        {recordId:5, skill:"Java", level:90}
      ],
      skillsTag:[
        {recordId:1, skill:"Angular"},
        {recordId:2, skill:"Firebase"},
        {recordId:3, skill:"Bootstrap"},
        {recordId:4, skill:"React"},
        {recordId:5, skill:"Flex"},
        {recordId:6, skill:"Foundation"},
        {recordId:7, skill:"Sax"},
        {recordId:8, skill:"Couch DB"},
        {recordId:9, skill:"Kafka"},
        {recordId:10, skill:"Eclipse IDE"}
      ]
    }
  };

});
