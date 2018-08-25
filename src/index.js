import '../node_modules/font-awesome/css/font-awesome.css';
import './styles/main.less';
import './styles/webaudio-knob.less';
import './styles/webaudio-keyboard.less';
import '../node_modules/ui-select/dist/select.css'

import 'bootstrap';
import 'angular-route';
import 'angular-ui-bootstrap';
import 'underscore';
import 'angular-touch';
import 'ui-select';
import 'angular-sanitize';

const app = angular.module('audio-app', [
    'ngRoute',
    'ui.bootstrap',
    'ui.bootstrap.tpls',
    'ngTouch',
    'ui.select',
    'ngSanitize'
]);

import HomeController from './controllers/home-controller';
app.controller('HomeController', HomeController);

app.directive('audioKnob', require('./directives/webaudio-knob'));
app.directive('audioKeyboard', require("./directives/webaudio-keyboard"));

app.config(['$routeProvider', '$locationProvider', '$httpProvider', 'uiSelectConfig', ($routeProvider, $locationProvider, uiSelectConfig) => {

    uiSelectConfig.theme = 'bootstrap';
    
    $routeProvider
        .when('/', {
            template: require('./views/home.html'),
            controller: 'HomeController',
            controllerAs: 'vm',
            label: 'Home',
            scopes: []
        })
        .otherwise({ redirectTo: '/' });

    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode(true);
}]);
