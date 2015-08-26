﻿/* -----------------------------------------------------------------------------------
   Arctic DEM
   Develolped by the Applications Prototype Lab
   (c) 2015 Esri | http://www.esri.com/legal/software-license  
----------------------------------------------------------------------------------- */

require([
    'esri/map',
    'esri/SpatialReference',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISImageServiceLayer',
    'esri/layers/RasterFunction',
    'esri/layers/ImageServiceParameters',
    'esri/geometry/Extent',
    'dojo/domReady!'
],
function (
    Map,
    SpatialReference,
    ArcGISTiledMapServiceLayer,
    ArcGISImageServiceLayer,
    RasterFunction,
    ImageServiceParameters,
    Extent
    ) {
    $(document).ready(function () {
        // Enforce strict mode
        'use strict';

        //
        var BASE = 'http://maps8.arcgisonline.com/arcgis/rest/services/Arctic_Polar_Ocean_Base/MapServer';
        var ARCTIC = 'http://maps.esri.com/apl15/rest/services/ArcticDEM/DEM/ImageServer';
        var FXN = 'DynamicShadedRelief_2';

        var _isMultiDirectional = false;

        // Configure UI
        $('#slider-sun-azimuth').slider({
            id: 'slider-sun-azimuth-div',
            ticks: [0, 45, 90, 135, 180, 225, 270, 315, 360],
            ticks_labels: ['0°', '45°', '90°', '135°', '180°', '225°', '270°', '315°', '360°'],
            range: false,
            value: 315,
            formatter: function (e) {
                return e + '°';
            }
        }).slider().on('slideStop', function () {
            setSunRenderingRule();
        });
        $('#slider-sun-altitude').slider({
            id: 'slider-sun-altitude-div',
            ticks: [0, 15, 30, 45, 60, 75, 90],
            ticks_labels: ['0°', '15°', '30°', '45°', '60°', '75°', '90°'],
            range: false,
            value: 45,
            formatter: function (e) {
                return e + '°';
            }
        }).slider().on('slideStop', function () {
            setSunRenderingRule();
        });
        $('#slider-elevation').slider({
            ticks: [0, 500, 1000, 1500, 2000, 2500],
            ticks_labels: ['0', '500', '1,000', '1,500', '2,000', '2,500'],
            range: true,
            value: [0, 2500],
            formatter: function (e) {
                return e[0] + 'm – ' + e[1] + 'm';
            }
        }).slider().on('slideStop', function () {
            setElevationRenderingRule();
        });
        $('#slider-slope').slider({
            ticks: [0, 15, 30, 45, 60, 75, 90],
            ticks_labels: ['0°', '15°', '30°', '45°', '60°', '75°', '90°'],
            range: true,
            value: [0, 90],
            formatter: function (e) {
                return e[0] + '° – ' + e[1] + '°';
            }
        }).slider().on('slideStop', function () {
            setElevationRenderingRule();
        });
        $('#slider-aspect').slider({
            ticks: [0, 45, 90, 135, 180, 225, 270, 315, 360],
            ticks_labels: ['0°', '45°', '90°', '135°', '180°', '225°', '270°', '315°', '360°'],
            range: true,
            value: [0, 360],
            formatter: function (e) {
                return e[0] + '° – ' + e[1] + '°';
            }
        }).slider().on('slideStop', function () {
            setElevationRenderingRule();
        });
        $('#buttonShow').click(function () {
            _sun.show();
            $(this).addClass('disabled').siblings().removeClass('disabled');
        });
        $('#buttonHide').click(function () {
            _sun.hide();
            $(this).addClass('disabled').siblings().removeClass('disabled');
        });
        $('#buttonReset').click(function () {
            $('#slider-elevation').slider('setValue', [
                $('#slider-elevation').slider('getAttribute', 'min'),
                $('#slider-elevation').slider('getAttribute', 'max')
            ]);
            $('#slider-aspect').slider('setValue', [
                $('#slider-aspect').slider('getAttribute', 'min'),
                $('#slider-aspect').slider('getAttribute', 'max')
            ]);
            $('#slider-slope').slider('setValue', [
                $('#slider-slope').slider('getAttribute', 'min'),
                $('#slider-slope').slider('getAttribute', 'max')
            ]);
            setElevationRenderingRule();
        });
        $('#titleHillshade').click(function () {
            _isMultiDirectional = !_isMultiDirectional;
            setSunRenderingRule();
        });

        // Create map
        var _bas = new ArcGISTiledMapServiceLayer(BASE);
        var _sun = new ArcGISImageServiceLayer(ARCTIC);
        var _ele = new ArcGISImageServiceLayer(ARCTIC, {opacity: 0.5});
        var _map = new Map('map', {
            logo: true,
            showAttribution: false,
            slider: true,
            extent: new Extent(1817644, -512794, 2162101, -306633,
                new SpatialReference(5936)
            )
        });
        setSunRenderingRule();
        setElevationRenderingRule();
        _map.addLayers([
            _bas,
            _sun,
            _ele
        ]);
       
        function setSunRenderingRule() {
            if (_isMultiDirectional) {
                _sun.setRenderingRule(new RasterFunction({
                    rasterFunction: 'MultiDirectionalShadedRelief_2'
                }));
                $('#slider-sun-azimuth').slider('disable');
                $('#slider-sun-altitude').slider('disable');
            }
            else {
                _sun.setRenderingRule(new RasterFunction({
                    rasterFunction: FXN,
                    functionArguments: {
                        Altitude: $('#slider-sun-altitude').slider('getValue'),
                        Azimuth: $('#slider-sun-azimuth').slider('getValue')
                    }
                }));
                $('#slider-sun-azimuth').slider('enable');
                $('#slider-sun-altitude').slider('enable');
            }
        }
        function setElevationRenderingRule() {
            var e_min = $('#slider-elevation').slider('getAttribute', 'min');
            var e_max = $('#slider-elevation').slider('getAttribute', 'max');
            var e_lef = $('#slider-elevation').slider('getValue')[0];
            var e_rig = $('#slider-elevation').slider('getValue')[1];

            var a_min = $('#slider-aspect').slider('getAttribute', 'min');
            var a_max = $('#slider-aspect').slider('getAttribute', 'max');
            var a_lef = $('#slider-aspect').slider('getValue')[0];
            var a_rig = $('#slider-aspect').slider('getValue')[1];

            var s_min = $('#slider-slope').slider('getAttribute', 'min');
            var s_max = $('#slider-slope').slider('getAttribute', 'max');
            var s_lef = $('#slider-slope').slider('getValue')[0];
            var s_rig = $('#slider-slope').slider('getValue')[1];

            if (e_min === e_lef && e_max === e_rig &&
                a_min === a_lef && a_max === a_rig &&
                s_min === s_lef && s_max === s_rig) {
                _ele.hide();
                return;
            }
            else {
                _ele.show();
            }
            
            _ele.setRenderingRule(new RasterFunction({
                rasterFunction: 'Filter_ElevationSlopeAspect',
                functionArguments: {
                    'NoDataRanges_Elevation': [
                        e_min,
                        e_lef,
                        e_rig,
                        e_max
                    ],
                    'InputRanges_Aspect': [
                        a_lef,
                        a_rig
                    ],
                    'InputRanges_Slope': [
                        s_lef,
                        s_rig
                    ]
                }
            }));
        }
    });
});