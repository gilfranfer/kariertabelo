let app = angular.module('Kariertabelo', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/home', {
    templateUrl: 'views/landing.html',
    controller: 'KariertabeloCtrl'
  })
  .otherwise({
    redirectTo: '/home'
  });
  $locationProvider.html5Mode(false);
});

app.controller('KariertabeloCtrl', function($scope) {});
