﻿'use strict';
define(['jquery',
    '../scripts/config'
],
    function ($, cf) {
        var utility;
        var config = cf.init();

        function loadScript() {
            var url = "scripts/bundles/task-scheduler-bundle.js";
            //var url = "http://localhost:8080/dist/task-scheduler-bundle.js";
            $.ajax({
                dataType: "script",
                cache: true,
                url: url
            });
        }

        return {
            init: function (wrapper, util, params, callback) {
                utility = util;


                window.dnn.initScheduler = function initializeScheduler() {
                    return {
                        utility: utility,
                        moduleName: 'TaskScheduler'
                    };
                };
                loadScript();

                if (config.debugMode === true) {
                    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.parent.__REACT_DEVTOOLS_GLOBAL_HOOK__;
                }

            },

            initMobile: function (wrapper, util, params, callback) {
                this.init(wrapper, util, params, callback);
            },

            load: function (params, callback) {
                var fb = window.dnn.formBuilder;
                if (fb && fb.load) {
                    fb.load();
                }
                var optin = window.dnn.optIn;
                if (optin && optin.load) {
                    var mode = getOptInMode();
                    optin.load(mode);
                }
            },

            loadMobile: function (params, callback) {
                this.load(params, callback);
            }
        };
    });

