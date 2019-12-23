const values = {
  paths:{
    home:"/home", profile:"/profile", login:"/login"
  }
};

const messages = {
  registration:{
    error:"Error during User creation:",
    working:"Registering User ..."
  },
  login:{
    working:"Login in progress ...",
    incorrectCredentials:"Incorrect email or password",
    genericError:"Login failed. Try again later."
  },
  resumePath:{
    working:"Checking availability ...",
    error:"The path is not available. Please select a different one.",
    success:"Your resume path has been set!"
  },
  customs:{
    working:"Saving preferences ...",
    success:"Preferences saved",
    error:"No preferences found"
  },
  generic:{
    dbError:"Error with database. Try again."
  }
};

let app = angular.module('Kariertabelo', ['ngRoute','firebase']);

/* Configure application routes */
app.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/home', {
    templateUrl: 'views/landing.html'
  })
  .when('/register', {
    templateUrl: 'views/register.html',
    controller: 'SignUpCtrl'
  })
  .when('/login', {
    templateUrl: 'views/login.html',
    controller: 'SignUpCtrl'
  })
  .when('/profile', {
    templateUrl: 'views/user-profile.html',
    controller: 'UserProfileCtrl',
    resolve: {
      currentAuth: function(SignUpSvc){
        return SignUpSvc.isUserLoggedIn();
      }
    }
  })
  .when('/customize', {
    templateUrl: 'views/customize.html',
    controller: 'CustomizeCtrl',
    resolve: {
      currentAuth: function(SignUpSvc){
        return SignUpSvc.isUserLoggedIn();
      }
    }
  })
  .when('/example', {
    templateUrl: 'views/resume_example.html',
    controller: 'ExampleResumeCtrl'
  })
  .otherwise({
    redirectTo: '/home'
  });
  $locationProvider.html5Mode(false);
});

/* Catch routeChangeErrors from $routeProvider when a route has a resolve. */
app.run(function($rootScope,$location){
	$rootScope.$on('$routeChangeError', function(event, next, previous, error){
		if(error == 'AUTH_REQUIRED'){
      //User is not logged in.
		}else{
			// $rootScope.response = {error:true, message: error};
		}
		$location.path( values.paths.login );
	});
});

app.controller('KariertabeloCtrl', function($rootScope, $scope, $location, $firebaseAuth) {

  $firebaseAuth().$onAuthStateChanged(function(user) {
    // console.debug("$onAuthStateChanged KariertabeloCtrl",user);
    if(user){
      $rootScope.currentSession = {authUser:user};
    }else{
      $rootScope.currentSession = null;
    }
  });

  $scope.logout = function() {
    $firebaseAuth().$signOut().then(function() {
      $location.path(values.paths.home);
    }).catch(function(error) {
      console.error(error);
    });
  };

  $scope.moveToRoute = function(route){
      $location.path(route);
  }

});

app.controller('UserProfileCtrl', function($rootScope, $scope, $location, $firebaseAuth) {

  var pathsCollection = firebase.firestore().collection("paths");
  var usersCollection = firebase.firestore().collection("users");
  $firebaseAuth().$onAuthStateChanged(function(user) {
    if(!user)return;
    usersCollection.doc(user.uid).get().then(function(userDoc) {
      if (!userDoc.exists) return null;
      //Get the Path for User's default resume
      return pathsCollection.doc(userDoc.data().resumeId).get();
    })
    .then(function(pathDoc){
      if(pathDoc.exists) {
        $scope.$apply(function(){
          $scope.resumePath = pathDoc.data().path;
        });
      }else{
        console.error("Path not exising for user:",user.uid);
      }
    })
    .catch(function(error) {
      console.error("Error getting document:", error);
    });

  });

  $scope.pathRegex = new RegExp("^[a-zA-Z0-9]{3,}$");

  $scope.saveResumePath = function(){
    $scope.pathResponse = {type:"info", message: messages.resumePath.working };
    //Check if Path is available
    var existingPath = false;
    var pathRef = firebase.firestore().collection("paths");
    var pathQuery = pathRef.where("path", "==", $scope.resumePath).limit(1);
    pathQuery.get().then(function(querySnapshot){
      querySnapshot.forEach(function(doc){ existingPath = true; });
      if(existingPath){
        $scope.$apply(function(){
          $scope.pathResponse = {type:"danger", message: messages.resumePath.error };
        });
      }else{
        //Update the path value in the user's document, inside paths collection
        return pathRef.doc($rootScope.currentSession.authUser.uid).set({
          userId: $rootScope.currentSession.authUser.uid,
          path: $scope.resumePath,
          since: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    })
    //After setting path
    .then(function() {
      if(existingPath) return;
      $scope.$apply(function(){
        $scope.pathResponse = {type:"success", message: messages.resumePath.success };
      });
    })
    .catch(function(error) {
      $scope.$apply(function(){
        $scope.pathResponse = {type:"danger", message: messages.generic.dbError };
      });
      console.error("Error getting document:", error);
    });
  };

});

app.controller('CustomizeCtrl', function($rootScope, $scope, $location, $firebaseAuth) {

  $firebaseAuth().$onAuthStateChanged(function(user) {
    if(!user)return;
    //Load User's Customs
    var customsRef = firebase.firestore().collection("customs").doc(user.uid);
    customsRef.get().then(function(doc) {
      if (doc.exists) {
        $scope.$apply(function(){
          $scope.customs = doc.data();
          // console.log($scope.customs);
        });
      }else{
        $scope.$apply(function(){
          $scope.customsResponse = {type:"danger", message: messages.customs.error };
        });
      }
    }).catch(function(error) {
      console.error("Error getting document:", error);
    });

  });

  $scope.saveCustoms = function(){
    $scope.customsResponse = {type:"info", message: messages.customs.working };
    var customsRef = firebase.firestore().collection("customs").doc($rootScope.currentSession.authUser.uid);
    customsRef.update($scope.customs)
    .then(function() {
      $scope.$apply(function(){
        $scope.customsResponse = {type:"success", message: messages.customs.success };
      });
    })
    .catch(function(error) {
        // The document probably doesn't exist.
        $scope.$apply(function(){
          $scope.customsResponse = {type:"danger", message: messages.generic.dbError };
        });
        console.error("Error updating document: ", error);
    });
  };

});

app.controller('SignUpCtrl', function($rootScope, $scope, $location, $firebaseAuth) {

  $scope.pwdRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");

  $scope.registerUser = function(){
    let email = $scope.registration.email;
    let passwd = $scope.registration.password;
    let pathsCollection = firebase.firestore().collection("paths");
    let usersCollection = firebase.firestore().collection("users");
    let newUserId;

    $scope.registerResponse = {type:"info", message: messages.registration.working };
    $firebaseAuth().$createUserWithEmailAndPassword(email, passwd)
    //User is automatically logged-in after registration
    .then(function(regUser){
      $location.path(values.paths.profile);
      newUserId = regUser.user.uid;
      return usersCollection.doc(newUserId).set({
        email: regUser.user.email,
        since: firebase.firestore.FieldValue.serverTimestamp()
      })
    })
    //Create the first Resume, Customs and Path
    .then(function() {
      var resumesCollection = usersCollection.doc(newUserId).collection("resumes");
      var autoId = resumesCollection.doc().id;
      resumesCollection.doc(autoId).set({
        contact:{email:email}
      }).then(function() {});

      var customsCollection = usersCollection.doc(newUserId).collection("customs");
      customsCollection.doc(autoId).set({
        baseColor: "#007bff",
        order: {profile:1, resume:2 },
        labels:{ education:"Education", interests:"Hobbies", languages:"Languages",
          projects:"Projects", skills:"Skills", summary:"Career Summary", work:"Work History"}
      }).then(function() {});

      pathsCollection.doc(autoId).set({
        path:newUserId,
        userId:newUserId,
        since: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function() {});
    }).catch(function(error) {
      // var errorCode = error.code;
      // var errorMessage = error.message;
      // auth/email-already-in-use: Thrown if there already exists an account with the given email address.
      // auth/invalid-email: Thrown if the email address is not valid.
      // auth/operation-not-allowed: Thrown if email/password accounts are not enabled. Enable email/password accounts in the Firebase Console, under the Auth tab.
      // auth/weak-password: Thrown if the password is not strong enough.
      console.error(error);
      $scope.registerResponse = {type:"danger", message: messages.registration.error+" "+error.message};
    });
  };

  $scope.loginUser = function() {
    let email = $scope.login.email;
    let passwd = $scope.login.password;

    $scope.loginResponse = {type:"info", message: messages.login.working };
    $firebaseAuth().$signInWithEmailAndPassword(email,passwd).then(function(user){
      console.debug(user);
      $location.path(values.paths.profile);
    })
    /* Catching unsuccessful login attempts */
    .catch( function(error){
      let errorMessage = undefined;
      switch(error.code) {
        case "auth/wrong-password":
        case "auth/user-not-found":
          errorMessage = messages.login.incorrectCredentials;
          break;
        default:
          errorMessage = messages.login.genericError;
      }
      $scope.loginResponse = {type:"danger", message: errorMessage };
    });;

  };

});

app.factory('SignUpSvc', function($firebaseAuth){
		return{
			isUserLoggedIn: function(){
				return $firebaseAuth().$requireSignIn();
			}
		};
});

/* Controller for the Example Resume */
app.controller('ExampleResumeCtrl', function($scope) {

  $scope.updateResumeColor = function(color){
    $scope.config.colors.profile.column = color;
    $scope.config.colors.profile.profile = color;
    $scope.config.colors.profile.bio = color;
    $scope.config.colors.profile.contact = color;
    $scope.config.colors.profile.education = color;
    $scope.config.colors.profile.languages = color;
    $scope.config.colors.profile.interests = color;

    $scope.config.colors.resume.title = color;
    $scope.config.colors.resume.circle = color;
    $scope.config.colors.resume.link = color;
    $scope.config.colors.resume.bar = color;
    $scope.config.colors.resume.skillBadge = color;
  };

  $scope.setProfileColSide = function(side){
      if(side == "left"){
        $scope.config.order = {
          profile:1, resume:2
        };
      }else{
        $scope.config.order = {
          profile:2, resume:1
        };
      }
  };

  $scope.config = {
    order: {
      profile:1,
      resume:2
    },
    colors:{
      profile:{
        column:"#28a745",
        profile:"#28a745",
        bio:"#28a745",
        contact:"#28a745",
        education:"#28a745",
        languages:"#28a745",
        interests:"#28a745",
        text:"#fff",
        link:"#ddd"
      },
      resume:{
        title:"#28a745",
        circle:"#28a745",
        icon:"#fff",
        text:"#444",
        link:"#28a745",
        bar:"#28a745",
        skillText:"#fff",
        skillBadge:"#28a745"
      }
    }
  };

  $scope.labels = {
    education:"Educación",
    languages:"Idiomas",
    interests:"Intereses",
    summary:"Resumen de Carrera",
    work:"Experiencia Laboral",
    projects:"Proyectos Personales",
    skills:"Habilidades y Conocimientos"
  };

  $scope.resumeData = {
    summary:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    profile:{
      firstname:"Francisco", lastname:"Gil",
      position:"Project Manager",
      location:"Veracruz, México",
      bio:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
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
      {order:1, degree:"Ingeniería de Software", school:"Universidad", period:"2008 - 2012"},
      {order:2, degree:"Administración de Software", school:"Universidad", period:"2017 - 2019"},
    ],
    languages:[
      {order:1, language:"Español", level:"Nativo"},
      {order:2, language:"Inglés", level:"Avanzado"},
      {order:3, language:"Alemán", level:"Básico"},
      {order:4, language:"Portugués", level:"Básico"}
    ],
    interests:[
      {order:1, interest:"Fotografía"},
      {order:2, interest:"Programación"},
      {order:3, interest:"Viajes"}
    ],
    work:[
      {order:1, role:"Desarrollador de Software", employer:"Softtek", location:"Monterrey, México", period:"Agosto 2011 - Junio 2014", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
      {order:2, role:"Líder Técnico", employer:"TCS México", location:"Guadalajara, México", period:"Junio 2014 - Marzo 2017", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
      {order:3, role:"Project Manager", employer:"TCS America", location:"San Antonio, Texas", period:"Abril 2017 - Presente", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
    ],
    projects:[
      {order:1, name:"Okulus", url:"http://okulusapp.netlify.com", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
      {order:2, name:"Kariertabelo", url:"http://kariertabelo.netlify.com", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
    ],
    skills:[
      {order:1, skill:"Angular"},
      {order:2, skill:"Firebase"},
      {order:3, skill:"Bootstrap"},
      {order:4, skill:"React"},
      {order:5, skill:"Flex"},
      {order:6, skill:"Foundation"},
      {order:7, skill:"Oracle"},
      {order:8, skill:"Couch DB"},
      {order:9, skill:"Kafka"},
      {order:10, skill:"Splunk"},
      {order:11, skill:"Python", level:70},
      {order:12, skill:"Kotlin", level:50},
      {order:13, skill:"JavaScript", level:75},
      {order:14, skill:"Java", level:90}
    ]
  };

});
