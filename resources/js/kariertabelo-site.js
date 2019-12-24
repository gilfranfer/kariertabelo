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
  resumeData:{
    working:"Saving Data...",
    success:"Data updated!"
  },
  educationData:{
    working:"Saving Education...",
    success:"Education saved!"
  },
  workData:{
    working:"Saving Work...",
    success:"Work saved!"
  },
  projectData:{
    working:"Saving Project...",
    success:"Project saved!"
  },
  skillsData:{
    working:"Saving Skill...",
    success:"Skill saved!"
  },
  languagesData:{
    working:"Saving Language...",
    success:"Language saved!"
  },
  interestsData:{
    working:"Saving Interests...",
    success:"Interests saved!"
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
  .when('/view/:resumeId', {
    templateUrl: 'views/resume.html',
    controller: 'ResumeViewCtrl'
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

  let usersCollection = firebase.firestore().collection("users");
  $firebaseAuth().$onAuthStateChanged(function(user) {
    // console.debug("$onAuthStateChanged KariertabeloCtrl",user);
    if(user){
      $rootScope.currentSession = {authUser:user};
      let userDocument = usersCollection.doc(user.uid).get();
      userDocument.then(function(userDoc) {
        if (!userDoc.exists) return null;
        $rootScope.currentSession.userData = userDoc.data();
      })
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

  $scope.resumeWorkExpanded = false;
  $scope.resumeSkillsExpanded = false;
  $scope.resumeProfileExpanded = false;
  $scope.resumeInterstsExpanded = false;
  $scope.resumeProjectsExpanded = false;
  $scope.resumeLanguageExpanded = false;
  $scope.resumeEducationExpanded = false;
		$scope.expandSection = function(section, value) {
			switch (section) {
				case 'resumeWork':
					$scope.resumeWorkExpanded = value;
					break;
				case 'resumeProfile':
					$scope.resumeProfileExpanded = value;
					break;
				case 'resumeLanguage':
					$scope.resumeLanguageExpanded = value;
					break;
          case 'resumeProjects':
          $scope.resumeProjectsExpanded = value;
					break;
				case 'resumeSkills':
					$scope.resumeSkillsExpanded = value;
					break;
				case 'resumeEducation':
					$scope.resumeEducationExpanded = value;
					break;
				case 'resumeIntersts':
					$scope.resumeInterstsExpanded = value;
					break;
			}
		};
});

app.controller('UserProfileCtrl', function($rootScope, $scope, $location, $firebaseAuth) {

  let pathsCollection = firebase.firestore().collection("paths");
  let usersCollection = firebase.firestore().collection("users");
  let currentResumeDoc = undefined;

  $firebaseAuth().$onAuthStateChanged(function(user) {
    if(!user)return;
    // $scope.resumeId - to track in the view the current resume
    let userDocument = usersCollection.doc(user.uid).get();
    userDocument.then(function(userDoc) {
      if (!userDoc.exists) return null;
      return pathsCollection.doc(userDoc.data().resumeId).get();
    })
    .then(function(pathDoc){
      if(pathDoc.exists) {
        $scope.$apply(function(){
          $scope.resumePathObj = { id:pathDoc.id, path:pathDoc.data().path};
        });
      }else{
        console.error("Path not exising for user:",user.uid);
      }
    })
    .catch(function(error) {
      console.error("Error getting document:", error);
    });

    userDocument.then(function(userDoc) {
      if (!userDoc.exists) return null;
      $scope.resumeId = userDoc.data().resumeId;
      currentResumeDoc = usersCollection.doc(user.uid).collection("resumes").doc(userDoc.data().resumeId);
      return currentResumeDoc.get();
    })
    .then(function(resumeDoc){
      $scope.$apply(function(){
        $scope.resumeData = resumeDoc.data();
      });
    });

  });

  $scope.pathRegex = new RegExp("^[a-zA-Z0-9]{3,}$");

  $scope.saveResumePath = function(){
    $scope.pathResponse = {type:"info", message: messages.resumePath.working };
    //Check if Path is available
    var existingPath = false;
    let pathData = undefined;
    var pathsCollection = firebase.firestore().collection("paths");

    pathsCollection.where("path", "==", $scope.resumePathObj.path).limit(1).get().then(function(querySnapshot){
      querySnapshot.forEach(function(doc){ pathData = doc.data(); });
      if(pathData){
        $scope.$apply(function(){
          if(pathData.userId == $rootScope.currentSession.authUser.uid){
            $scope.pathResponse = {type:"success", message: messages.resumePath.success };
          }else{
            $scope.pathResponse = {type:"danger", message: messages.resumePath.error };
          }
        });
      }else{
        //Update the path value in the user's document, inside paths collection
        return pathsCollection.doc($scope.resumePathObj.id).set({
          userId: $rootScope.currentSession.authUser.uid,
          path: $scope.resumePathObj.path,
          since: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    })
    //After setting path
    .then(function() {
      if(pathData) return;
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

  $scope.saveResumeData = function(){
    $scope.dataResponse = {type:"info", message: messages.resumeData.working };
    let resumesCollection = usersCollection.doc($rootScope.currentSession.authUser.uid).collection("resumes");
    resumesCollection.doc($scope.resumeId).update($scope.resumeData).then(function(ref){
      $scope.$apply(function(){
        $scope.dataResponse = {type:"success", message: messages.resumeData.success };
      });
    }).catch(function(error) {
      $scope.$apply(function(){
        $scope.dataResponse = {type:"danger", message: messages.generic.dbError };
      });
      console.error("Error getting document:", error);
    });
  };

  $scope.getEducationList = function(){
    currentResumeDoc.collection("education").get().then(function(data) {
      // console.log(data);
      educationList = new Array();
      data.forEach(function(doc) {
        let record = doc.data();
        record.id = doc.id;
        educationList.push(record);
      });
      $scope.$apply(function() {
        $scope.educationList = educationList;
      });
    });
  };

  $scope.editEducation = function(record){
    let newEducation = {id:record.id, title:record.title, school:record.school, from:new Date(record.from)};
    if(record.to){
      newEducation.to = new Date(record.to);
    }
    $scope.newEducation = newEducation;
  };

  $scope.saveEducation = function(){
    $scope.educationResponse = {type:"info", message: messages.educationData.working };
    let record = {
      title: $scope.newEducation.title,
      school: $scope.newEducation.school,
      from: $scope.newEducation.from.getTime()
    };
    if($scope.newEducation.to){
      record.to = $scope.newEducation.to.getTime();
    }

    if(!$scope.newEducation.id){
      //Create new record
      let newRecordId = currentResumeDoc.collection("education").doc().id;
      currentResumeDoc.collection("education").doc(newRecordId).set(record).then(function(){
        record.id = newRecordId;
        $scope.$apply(function(){
          $scope.educationList.push(record);
          $scope.educationResponse = {type:"success", message: messages.educationData.success };
        });
      }).catch(function(error) {
        $scope.$apply(function(){
          $scope.educationResponse = {type:"danger", message: messages.generic.dbError };
        });
        console.error("Error saving document:", error);
      });
    }
    //Updating existing record
    else{
      let newRecordId = $scope.newEducation.id;
      currentResumeDoc.collection("education").doc(newRecordId).set(record).then(function(){
        record.id = newRecordId;
        removeEducationFromArray({id:newRecordId});
        $scope.$apply(function(){
          $scope.educationList.push(record);
          $scope.educationResponse = {type:"success", message: messages.educationData.success };
        });
      }).catch(function(error) {
        $scope.$apply(function(){
          $scope.educationResponse = {type:"danger", message: messages.generic.dbError };
        });
        console.error("Error saving document:", error);
      });
    }
    $scope.newEducation = undefined;
  };

  $scope.removeEducation = function(record) {
    currentResumeDoc.collection("education").doc(record.id).delete().then(function() {
      $scope.$apply(function(){
        removeEducationFromArray(record);
      });
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
  };

  removeEducationFromArray = function(record) {
    $scope.educationList.some(function(element, index) {
      if(element.id === record.id){
        $scope.educationList.splice(index,1);
      }
      return (element.id === record.id)
    });
  };

  $scope.getWorkList = function(){
    currentResumeDoc.collection("work").get().then(function(data) {
      let workList = new Array();
      data.forEach(function(doc) {
        let record = doc.data();
        record.id = doc.id;
        workList.push(record);
      });
      $scope.$apply(function() {
        $scope.workList = workList;
      });
    });
  };

  $scope.editWork = function(record){
    let newWork = {id:record.id, title:record.title, employer:record.employer, location:record.location, description:record.description, from:new Date(record.from)};
    if(record.to){
      newWork.to = new Date(record.to);
    }
    $scope.newWork = newWork;
  };

  $scope.saveWork = function(){
    $scope.workResponse = {type:"info", message: messages.workData.working };
    let record = {
      title: $scope.newWork.title,
      employer: $scope.newWork.employer,
      location: $scope.newWork.location,
      from: $scope.newWork.from.getTime()
    };
    if($scope.newWork.to){
      record.to = $scope.newWork.to.getTime();
    }
    if($scope.newWork.description){
      record.description = $scope.newWork.description;
    }

    if(!$scope.newWork.id){
      //Create new record
      let newRecordId = currentResumeDoc.collection("work").doc().id;
      currentResumeDoc.collection("work").doc(newRecordId).set(record).then(function(){
        record.id = newRecordId;
        $scope.$apply(function(){
          $scope.workList.push(record);
          $scope.workResponse = {type:"success", message: messages.workData.success };
        });
      }).catch(function(error) {
        $scope.$apply(function(){
          $scope.workResponse = {type:"danger", message: messages.generic.dbError };
        });
        console.error("Error saving document:", error);
      });
    }
    //Updating existing record
    else{
      let newRecordId = $scope.newWork.id;
      currentResumeDoc.collection("work").doc(newRecordId).set(record).then(function(){
        record.id = newRecordId;
        removeWorkFromArray({id:newRecordId});
        $scope.$apply(function(){
          $scope.workList.push(record);
          $scope.workResponse = {type:"success", message: messages.workData.success };
        });
      }).catch(function(error) {
        $scope.$apply(function(){
          $scope.workResponse = {type:"danger", message: messages.generic.dbError };
        });
        console.error("Error saving document:", error);
      });
    }
    $scope.newWork = undefined;
  };

  $scope.removeWork = function(record) {
    currentResumeDoc.collection("work").doc(record.id).delete().then(function() {
      $scope.$apply(function(){
        removeWorkFromArray(record);
      });
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
  };

  removeWorkFromArray = function(record) {
    $scope.workList.some(function(element, index) {
      if(element.id === record.id){
        $scope.workList.splice(index,1);
      }
      return (element.id === record.id)
    });
  };

  $scope.getProjectList = function(){
    currentResumeDoc.collection("projects").get().then(function(data) {
      let projectsList = new Array();
      data.forEach(function(doc) {
        let record = doc.data();
        record.id = doc.id;
        projectsList.push(record);
      });
      $scope.$apply(function() {
        $scope.projectsList = projectsList;
      });
    });
  };

  $scope.editProject = function(record){
    let newProject = {id:record.id, name:record.name, date: new Date(record.date)};
    if(record.url){
      newProject.url = record.url;
    }
    if(record.description){
      newProject.description = record.description;
    }
    $scope.newProject = newProject;
  };

  $scope.saveProject = function(){
    $scope.projectResponse = {type:"info", message: messages.projectData.working };
    let record = {
      name: $scope.newProject.name,
      date: $scope.newProject.date.getTime()
    };
    if($scope.newProject.description){
      record.description = $scope.newProject.description;
    }
    if($scope.newProject.url){
      record.url = $scope.newProject.url;
    }

    if(!$scope.newProject.id){
      //Create new record
      let newRecordId = currentResumeDoc.collection("projects").doc().id;
      currentResumeDoc.collection("projects").doc(newRecordId).set(record).then(function(){
        record.id = newRecordId;
        $scope.$apply(function(){
          $scope.projectsList.push(record);
          $scope.projectResponse = {type:"success", message: messages.projectData.success };
        });
      }).catch(function(error) {
        $scope.$apply(function(){
          $scope.projectResponse = {type:"danger", message: messages.generic.dbError };
        });
        console.error("Error saving document:", error);
      });
    }
    //Updating existing record
    else{
      let newRecordId = $scope.newProject.id;
      currentResumeDoc.collection("projects").doc(newRecordId).set(record).then(function(){
        record.id = newRecordId;
        removeProjectFromArray({id:newRecordId});
        $scope.$apply(function(){
          $scope.projectsList.push(record);
          $scope.projectResponse = {type:"success", message: messages.projectData.success };
        });
      }).catch(function(error) {
        $scope.$apply(function(){
          $scope.projectResponse = {type:"danger", message: messages.generic.dbError };
        });
        console.error("Error saving document:", error);
      });
    }
    $scope.newProject = undefined;
  };

  $scope.removeProject = function(record) {
    currentResumeDoc.collection("projects").doc(record.id).delete().then(function() {
      $scope.$apply(function(){
        removeProjectFromArray(record);
      });
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
  };

  removeProjectFromArray = function(record) {
    $scope.projectsList.some(function(element, index) {
      if(element.id === record.id){
        $scope.projectsList.splice(index,1);
      }
      return (element.id === record.id)
    });
  };

  $scope.getSkillsList = function(){
    currentResumeDoc.collection("skills").get().then(function(data) {
      let skillsList = new Array();
      data.forEach(function(doc) {
        let record = doc.data();
        record.id = doc.id;
        skillsList.push(record);
      });
      $scope.$apply(function() {
        $scope.skillsList = skillsList;
      });
    });
  };

  $scope.editSkill = function(record){
    let newSkill = {id:record.id, skill:record.skill};
    if(record.level){
      newSkill.level = record.level;
    }
    $scope.newSkill = newSkill;
  };

  $scope.saveSkill = function(){
    $scope.skillsResponse = {type:"info", message: messages.skillsData.working };
    let record = { skill: $scope.newSkill.skill };
    if($scope.newSkill.level){
      record.level = $scope.newSkill.level;
    }

    if(!$scope.newSkill.id){
      //Create new record
      let newRecordId = currentResumeDoc.collection("skills").doc().id;
      currentResumeDoc.collection("skills").doc(newRecordId).set(record).then(function(){
        record.id = newRecordId;
        $scope.$apply(function(){
          $scope.skillsList.push(record);
          $scope.skillsResponse = {type:"success", message: messages.skillsData.success };
        });
      }).catch(function(error) {
        $scope.$apply(function(){
          $scope.skillsResponse = {type:"danger", message: messages.generic.dbError };
        });
        console.error("Error saving document:", error);
      });
    }
    //Updating existing record
    else{
      let newRecordId = $scope.newSkill.id;
      currentResumeDoc.collection("skills").doc(newRecordId).set(record).then(function(){
        record.id = newRecordId;
        removeSkillFromArray({id:newRecordId});
        $scope.$apply(function(){
          $scope.skillsList.push(record);
          $scope.skillsResponse = {type:"success", message: messages.skillsData.success };
        });
      }).catch(function(error) {
        $scope.$apply(function(){
          $scope.skillsResponse = {type:"danger", message: messages.generic.dbError };
        });
        console.error("Error saving document:", error);
      });
    }
    $scope.newSkill = undefined;
  };

  $scope.removeSkill = function(record) {
    currentResumeDoc.collection("skills").doc(record.id).delete().then(function() {
      $scope.$apply(function(){
        removeSkillFromArray(record);
      });
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
  };

  removeSkillFromArray = function(record) {
    $scope.skillsList.some(function(element, index) {
      if(element.id === record.id){
        $scope.skillsList.splice(index,1);
      }
      return (element.id === record.id)
    });
  };

  $scope.getLanguagesList = function(){
    currentResumeDoc.collection("languages").get().then(function(data) {
      let languagesList = new Array();
      data.forEach(function(doc) {
        let record = doc.data();
        record.id = doc.id;
        languagesList.push(record);
      });
      $scope.$apply(function() {
        $scope.languagesList = languagesList;
      });
    });
  };

  $scope.editLanguage = function(record){
    let newLanguage = {id:record.id, language:record.language, level:record.level};
    $scope.newLanguage = newLanguage;
  };

  $scope.saveLanguage = function(){
    $scope.languagesResponse = {type:"info", message: messages.languagesData.working };
    let record = { language: $scope.newLanguage.language, level: $scope.newLanguage.level };

    if(!$scope.newLanguage.id){
      //Create new record
      let newRecordId = currentResumeDoc.collection("languages").doc().id;
      currentResumeDoc.collection("languages").doc(newRecordId).set(record).then(function(){
        record.id = newRecordId;
        $scope.$apply(function(){
          $scope.languagesList.push(record);
          $scope.languagesResponse = {type:"success", message: messages.languagesData.success };
        });
      }).catch(function(error) {
        $scope.$apply(function(){
          $scope.languagesResponse = {type:"danger", message: messages.generic.dbError };
        });
        console.error("Error saving document:", error);
      });
    }
    //Updating existing record
    else{
      let newRecordId = $scope.newLanguage.id;
      currentResumeDoc.collection("languages").doc(newRecordId).set(record).then(function(){
        record.id = newRecordId;
        removeLanguageFromArray({id:newRecordId});
        $scope.$apply(function(){
          $scope.languagesList.push(record);
          $scope.languagesResponse = {type:"success", message: messages.languagesData.success };
        });
      }).catch(function(error) {
        $scope.$apply(function(){
          $scope.languagesResponse = {type:"danger", message: messages.generic.dbError };
        });
        console.error("Error saving document:", error);
      });
    }
    $scope.newLanguage = undefined;
  };

  $scope.removeLanguage = function(record) {
    currentResumeDoc.collection("languages").doc(record.id).delete().then(function() {
      $scope.$apply(function(){
        removeLanguageFromArray(record);
      });
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
  };

  removeLanguageFromArray = function(record) {
    $scope.languagesList.some(function(element, index) {
      if(element.id === record.id){
        $scope.languagesList.splice(index,1);
      }
      return (element.id === record.id)
    });
  };

  $scope.getInterestsList = function(){
    currentResumeDoc.collection("interests").get().then(function(data) {
      let interestsList = new Array();
      data.forEach(function(doc) {
        let record = doc.data();
        record.id = doc.id;
        interestsList.push(record);
      });
      $scope.$apply(function() {
        $scope.interestsList = interestsList;
      });
    });
  };

  $scope.editInterest = function(record){
    let newInterest = {id:record.id, interest:record.interest};
    $scope.newInterest = newInterest;
  };

  $scope.saveInterest = function(){
    $scope.interestsResponse = {type:"info", message: messages.interestsData.working };
    let record = { interest: $scope.newInterest.interest };

    if(!$scope.newInterest.id){
      //Create new record
      let newRecordId = currentResumeDoc.collection("interests").doc().id;
      currentResumeDoc.collection("interests").doc(newRecordId).set(record).then(function(){
        record.id = newRecordId;
        $scope.$apply(function(){
          $scope.interestsList.push(record);
          $scope.interestsResponse = {type:"success", message: messages.interestsData.success };
        });
      }).catch(function(error) {
        $scope.$apply(function(){
          $scope.interestsResponse = {type:"danger", message: messages.generic.dbError };
        });
        console.error("Error saving document:", error);
      });
    }
    //Updating existing record
    else{
      let newRecordId = $scope.newInterest.id;
      currentResumeDoc.collection("interests").doc(newRecordId).set(record).then(function(){
        record.id = newRecordId;
        removeInterestFromArray({id:newRecordId});
        $scope.$apply(function(){
          $scope.interestsList.push(record);
          $scope.interestsResponse = {type:"success", message: messages.interestsData.success };
        });
      }).catch(function(error) {
        $scope.$apply(function(){
          $scope.interestsResponse = {type:"danger", message: messages.generic.dbError };
        });
        console.error("Error saving document:", error);
      });
    }
    $scope.newInterest = undefined;
  };

  $scope.removeInterest = function(record) {
    currentResumeDoc.collection("interests").doc(record.id).delete().then(function() {
      $scope.$apply(function(){
        removeInterestFromArray(record);
      });
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
  };

  removeInterestFromArray = function(record) {
    $scope.interestsList.some(function(element, index) {
      if(element.id === record.id){
        $scope.interestsList.splice(index,1);
      }
      return (element.id === record.id)
    });
  };

});

app.controller('CustomizeCtrl', function($rootScope, $scope, $location, $firebaseAuth) {

  let usersCollection = firebase.firestore().collection("users");
  $firebaseAuth().$onAuthStateChanged(function(user) {
    if(!user)return;

    let userDocument = usersCollection.doc(user.uid).get();
    userDocument.then(function(userDoc) {
      if (!userDoc.exists) return null;

      $scope.resumeId = userDoc.data().resumeId;
      return usersCollection.doc(user.uid).collection("customs").doc(userDoc.data().resumeId).get();
    })
    .then(function(customsDoc){
      if (customsDoc.exists) {
        $scope.$apply(function(){
          $scope.customs = customsDoc.data();
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
    var customsRef = usersCollection.doc($rootScope.currentSession.authUser.uid).collection("customs").doc($scope.resumeId);
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

app.controller('ResumeViewCtrl', function($rootScope, $scope, $location, $firebaseAuth, $routeParams) {

  $firebaseAuth().$onAuthStateChanged(function(user) {
    if(!user)return;

    let resumeId = $routeParams.resumeId;
    console.log(resumeId);
    return;

  });

});

app.controller('SignUpCtrl', function($rootScope, $scope, $location, $firebaseAuth) {

  $scope.pwdRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");

  $scope.registerUser = function(){
    let email = $scope.registration.email;
    let passwd = $scope.registration.password;
    let pathsCollection = firebase.firestore().collection("paths");
    let usersCollection = firebase.firestore().collection("users");
    var autoId = pathsCollection.doc().id;
    let newUserId;

    $scope.registerResponse = {type:"info", message: messages.registration.working };
    $firebaseAuth().$createUserWithEmailAndPassword(email, passwd)
    //User is automatically logged-in after registration
    .then(function(regUser){
      $location.path(values.paths.profile);
      newUserId = regUser.user.uid;
      return usersCollection.doc(newUserId).set({
        email: regUser.user.email,
        since: firebase.firestore.FieldValue.serverTimestamp(),
        resumeId: autoId
      })
    })
    //Create the first Resume, Customs and Path
    .then(function() {
      var resumesCollection = usersCollection.doc(newUserId).collection("resumes");
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
