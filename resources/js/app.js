let app = angular.module('Kariertabelo', []);

app.controller('KariertabeloCtrl', function($scope) {

  $scope.order = {
    profile:1,
    resume:2
  };
  $scope.colors = {
    profile:{
      column:"#2d7788",
      profile:"#2d7788",
      bio:"#2d7788",
      contact:"#2d7788",
      education:"#2d7788",
      languages:"#2d7788",
      interests:"#2d7788",
      text:"#fff",
      link:"#ddd"
    },
    resume:{
      title:"#2d7788",
      circle:"#2d7788",
      icon:"#fff",
      text:"#444",
      link:"#2d7788",
      bar:"#2d7788",
      skillText:"#fff",
      skillBadge:"#2d7788"
    }
  };

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
      position:"Project Manager",
      location:"Veracruz, México"
    },
    bio:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    contact:{
      email:"gil.franfer@gmail.com",
      phone:"+52 2211000011",
      webpage:"gillab.netlify.com",
      github:"github.com/gilfranfer",
      linkedin:"linkedin.com/in/gilfranfer/",
      twitter:"",
      facebook:"",
      instagram:""
      /*,whatsapp:"",snapchat:""*/
    },
    education:[
      {recordId:1, degree:"Ingeniería de Software", school:"Universidad", period:"2008 - 2012"},
      {recordId:2, degree:"Administración de Software", school:"Universidad", period:"2017 - 2019"},
    ],
    languages:[
      {recordId:1, language:"Español", level:"Nativo"},
      {recordId:2, language:"Inglés", level:"Avanzado"},
      {recordId:3, language:"Alemán", level:"Básico"},
      {recordId:4, language:"Portugués", level:"Básico"}
    ],
    interests:[
      {recordId:1, interest:"Fotografía"},
      {recordId:2, interest:"Programación"},
      {recordId:3, interest:"Viajes"}
    ],
    resume:{
      summary:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      work:[
        {recordId:1, role:"Desarrollador de Software", employer:"Softtek", location:"Monterrey, México", period:"Agosto 2011 - Junio 2014", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
        {recordId:2, role:"Líder Técnico", employer:"TCS México", location:"Guadalajara, México", period:"Junio 2014 - Marzo 2017", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
        {recordId:3, role:"Project Manager", employer:"TCS America", location:"San Antonio, Texas", period:"Abril 2017 - Presente", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
      ],
      projects:[
        {recordId:1, name:"Okulus", url:"http://okulus.netlify.com", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
        {recordId:2, name:"Kariertabelo", url:"http://kariertabelo.netlify.com", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
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
        {recordId:7, skill:"Oracle"},
        {recordId:8, skill:"Couch DB"},
        {recordId:9, skill:"Kafka"},
        {recordId:10, skill:"Splunk"}
      ]
    }
  };

});
