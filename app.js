(function() {
    'use strict';

    angular.module('mrUP', [])
        .directive('mrUptake', function() {
            return {
                restrict: 'A',
                scope: {},
                templateUrl: 'voice.html',
                controller: 'MrUptakeController',
                controllerAs: 'mrupVm'
            };
        })
        .controller('MrUptakeController', MrUptakeController);


    function MrUptakeController($window, $timeout){
        var mrupVm = this;
        var natural = $window.natural;
        var isActivated = false;
        var startListener = startListener;
        var recognition = new webkitSpeechRecognition();
        recognition.onend = onend;
        recognition.onresult = generateQuery;
        mrupVm.manualActivate = manualActivate;

        startListener();

        ///////

        function startListener() {
            mrupVm.text = mrupVm.text || '';
            recognition.start();
        }

        function onend() {
            startListener();
        }

        function generateQuery(event) {
            var listenerOutput = '';
            //todo opti this loop
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    listenerOutput += event.results[i][0].transcript;
                }
            }
            if(isActivated) {
                if (processAndRegister(listenerOutput, 'sleep')) {
                    isActivated = false;
                    mrupVm.text = null;
                } else {
                    $timeout(function() {
                        mrupVm.text = listenerOutput;
                    });
                    var msg = new SpeechSynthesisUtterance(listenerOutput);
                    window.speechSynthesis.speak(msg);
                    //todo nlp sauce here instead of pasting shit on screen
                }
            } else {
                isActivated = processAndRegister(listenerOutput, 'activate');
            }
            recognition.stop();
        }

        function processAndRegister(op, state) {
            var op = op.split(' ');
            if (op.length !== 2) return false;
            var isJason =  (natural.JaroWinklerDistance(op[1],'jason') > 0.8);
            if (state === 'activate') {
                return ((natural.JaroWinklerDistance(op[0],'hey') > 0.8) && isJason)
            } else {
                return ((natural.JaroWinklerDistance(op[0],'bye') > 0.8) && isJason)
            }
            return false;
        }

        function manualActivate() {
            isActivated = !isActivated;
        }
    }




})();