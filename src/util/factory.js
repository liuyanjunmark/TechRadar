const d3 = require('d3');
const Tabletop = require('tabletop');
const _ = {
    map: require('lodash/map'),
    uniqBy: require('lodash/uniqBy'),
    capitalize: require('lodash/capitalize'),
    each: require('lodash/each')
};

const InputSanitizer = require('./inputSanitizer');
const Radar = require('../models/radar');
const Quadrant = require('../models/quadrant');
const Ring = require('../models/ring');
const Blip = require('../models/blip');
const GraphingRadar = require('../graphing/radar');
const MalformedDataError = require('../exceptions/malformedDataError');
const SheetNotFoundError = require('../exceptions/sheetNotFoundError');
const ContentValidator = require('./contentValidator');
const Sheet = require('./sheet');
const ExceptionMessages = require('./exceptionMessages');


const ExcelReader = require('./readxlsx');


const GoogleSheet = function (sheetReference, sheetName) {
    var self = {};

    self.build = function () {
        // var sheet = new Sheet(sheetReference);
        // sheet.exists(function(notFound) {
        //     if (notFound) {
        //         displayErrorMessage(notFound);
        //         return;
        //     }
        // 	debugger;
        //     Tabletop.init({
        //         key: sheet.id,
        //         callback: createRadar
        //     });
        // });

        var dataReader = new ExcelReader(sheetReference);
        dataReader.Load(function(){
            createRadar(this, dataReader.Result);
        });

        function displayErrorMessage(exception) {
            d3.selectAll(".loading").remove();
            var message = 'Oops! It seems like there are some problems with loading your data. ';

            if (exception instanceof MalformedDataError) {
                message = message.concat(exception.message);
            } else if (exception instanceof SheetNotFoundError) {
                message = exception.message;
            } else {
                console.error(exception);
            }

            message = message.concat('<br/>', 'Please check <a href="https://info.thoughtworks.com/visualize-your-tech-strategy-guide.html#faq">FAQs</a> for possible solutions.');

            d3.select('body')
                .append('div')
                .attr('class', 'error-container')
                .append('div')
                .attr('class', 'error-container__message')
                .append('p')
                .html(message);
        }

        function createRadar(__, dataSource) {

            try {

                // if (!sheetName) {
                //     sheetName = tabletop.foundSheetNames[0];
                // }
                // var columnNames = tabletop.sheets(sheetName).columnNames;

                // var contentValidator = new ContentValidator(columnNames);
                // contentValidator.verifyContent();
                // contentValidator.verifyHeaders();

                // var all = tabletop.sheets(sheetName).all();
                // var blips = _.map(all, new InputSanitizer().sanitize);

                if(!dataSource)
                throw new ExceptionMessages();
                

                var blips = _.map(dataSource, new InputSanitizer().sanitize);

                // document.title = tabletop.googleSheetName;
                d3.selectAll(".loading").remove();

                var rings = _.map(_.uniqBy(blips, 'ring'), 'ring');
                var ringMap = {};
                var maxRings = 4;

                _.each(rings, function (ringName, i) {
                    if (i == maxRings) {
                        throw new MalformedDataError(ExceptionMessages.TOO_MANY_RINGS);
                    }
                    ringMap[ringName] = new Ring(ringName, i);
                });

                var quadrants = {};
                _.each(blips, function (blip) {
                    if (!quadrants[blip.quadrant]) {
                        quadrants[blip.quadrant] = new Quadrant(_.capitalize(blip.quadrant));
                    }
                    quadrants[blip.quadrant].add(new Blip(blip.name, ringMap[blip.ring], blip.isNew.toLowerCase() === 'true', blip.topic, blip.description))
                });

                var radar = new Radar();
                _.each(quadrants, function (quadrant) {
                    radar.addQuadrant(quadrant)
                });

                var size = (window.innerHeight - 163) < 520 ? 520 : window.innerHeight - 163;

                new GraphingRadar(size, radar).init().plot();

            } catch (exception) {
                displayErrorMessage(exception);
            }
        }
    };

    self.init = function () {
        var content = d3.select('body')
            .append('div')
            .attr('class', 'loading')
            .append('div')
            .attr('class', 'input-sheet');

        set_document_title();

        plotLogo(content);

        var bannerText = '<h1>Building your radar...</h1><p>Your Technology Radar will be available in just a few seconds</p>';
        plotBanner(content, bannerText);
        plotFooter(content);


        return self;
    };

    return self;
};

var AllData = function () {
    var data = [
        {
            "name": "test1",
            "description": "This is the description. You can use basic html such as the <strong>strong tag to emphasise keywords and phrases</strong> and insert <a href='https://www.thoughtworks.com'>anchor links to documentation and referance material</a>.",
            "isNew": "TRUE",
            "ring": "adopt",
            "quadrant": "tools"
        },
        {
            "name": "test2",
            "description": "<a href='http://www.baidu.com'>Test to BAIDU</a>",
            "isNew": "FALSE",
            "ring": "trial",
            "quadrant": "languages & frameworks"
        },
        {
            "name": "test3",
            "description": "This is the description. You can use basic html such as the <strong>strong tag to emphasise keywords and phrases</strong> and insert <a href='https://www.thoughtworks.com'>anchor links to documentation and referance material</a>.",
            "isNew": "FALSE",
            "ring": "assess",
            "quadrant": "platforms"
        },
        {
            "name": "test4",
            "description": "This is the description. You can use basic html such as the <strong>strong tag to emphasise keywords and phrases</strong> and insert <a href='https://www.thoughtworks.com'>anchor links to documentation and referance material</a>.",
            "isNew": "FALSE",
            "ring": "hold",
            "quadrant": "techniques"
        },
        {
            "name": "test5",
            "description": "This is the description. You can use basic html such as the <strong>strong tag to emphasise keywords and phrases</strong> and insert <a href='https://www.thoughtworks.com'>anchor links to documentation and referance material</a>.",
            "isNew": "TRUE",
            "ring": "hold",
            "quadrant": "tools"
        },
        {
            "name": "test6",
            "description": "<a href='http://www.baidu.com'>Test to BAIDU</a>",
            "isNew": "TRUE",
            "ring": "assess",
            "quadrant": "languages & frameworks"
        },
        {
            "name": "test7",
            "description": "This is the description. You can use basic html such as the <strong>strong tag to emphasise keywords and phrases</strong> and insert <a href='https://www.thoughtworks.com'>anchor links to documentation and referance material</a>.",
            "isNew": "FALSE",
            "ring": "hold",
            "quadrant": "platforms"
        },
        {
            "name": "test8",
            "description": "This is the description. You can use basic html such as the <strong>strong tag to emphasise keywords and phrases</strong> and insert <a href='https://www.thoughtworks.com'>anchor links to documentation and referance material</a>.",
            "isNew": "FALSE",
            "ring": "trial",
            "quadrant": "techniques"
        }
    ];
    return data;

}


var QueryParams = function (queryString) {
    var decode = function (s) {
        return decodeURIComponent(s.replace(/\+/g, " "));
    };

    var search = /([^&=]+)=?([^&]*)/g;

    var queryParams = {};
    var match;
    while (match = search.exec(queryString))
        queryParams[decode(match[1])] = decode(match[2]);

    return queryParams
};




const GoogleSheetInput = function () {
    var self = {};

    self.build = function () {
        var queryParams = QueryParams(window.location.search.substring(1));

        if (queryParams.sheetId) {
            var sheet = GoogleSheet(queryParams.sheetId, queryParams.sheetName);
            sheet.init().build();
        } else {
            var content = d3.select('body')
                .append('div')
                .attr('class', 'input-sheet');

            set_document_title();

            plotLogo(content);

            var bannerText = '<h3> <a href="https://www.thoughtworks.com/radar" target="blank">ThoughtWorks Open Source Radar</a> </h3>'+
            '<h3> <a href="http://localhost:15101/?sheetId=mbafc.json" target="blank">MBAFC Open Source Component Radar</a> </h3>'+
            '<h3> <a href="http://localhost:15101/?sheetId=mbafcpaysoftware.json" target="blank">MBAFC Commercial Software Radar</a> </h3>'+
            '<h4>Build your own radar</h4><p>Once you\'ve <a href ="https://info.thoughtworks.com/visualize-your-tech-strategy.html">created your Radar</a>, you can use this service' +
                ' to generate an <br />interactive version of your Technology Radar. Not sure how? <a href ="https://info.thoughtworks.com/visualize-your-tech-strategy-guide.html">Read this first.</a></p>';

            plotBanner(content, bannerText);

            plotForm(content);

            plotFooter(content);

        }
    };

    return self;
};

function set_document_title() {
    document.title = "Build your own Radar";
}

function plotLogo(content) {
    content.append('div')
        .attr('class', 'input-sheet__logo')
        .html('<a href="https://www.thoughtworks.com"><img src="/images/tw-logo.png" / ></a>');
}

function plotFooter(content) {
    content
        .append('div')
        .attr('id', 'footer')
        .append('div')
        .attr('class', 'footer-content')
        .append('p')
        .html('Powered by <a href="https://www.thoughtworks.com"> ThoughtWorks</a>. '
        + 'By using this service you agree to <a href="https://info.thoughtworks.com/visualize-your-tech-strategy-terms-of-service.html">ThoughtWorks\' terms of use</a>. '
        + 'You also agree to our <a href="https://www.thoughtworks.com/privacy-policy">privacy policy</a>, which describes how we will gather, use and protect any personal data contained in your public Google Sheet. '
        + 'This software is <a href="https://github.com/thoughtworks/build-your-own-radar">open source</a> and available for download and self-hosting.');



}

function plotBanner(content, text) {
    content.append('div')
        .attr('class', 'input-sheet__banner')
        .html(text);

}

function plotForm(content) {
    content.append('div')
        .attr('class', 'input-sheet__form')
        .append('p')
        .html('<strong>Enter the URL of your <a href="https://info.thoughtworks.com/visualize-your-tech-strategy-guide.html#publish-byor-sheet" target="_blank">published</a> Google Sheet below…</strong>');

    var form = content.select('.input-sheet__form').append('form')
        .attr('method', 'get');

    // var form = content.select('.input-sheet__form').append('form')
    //                                                 .attr('method', 'post')
    //                                                 .attr('action', '/files');
    var form = content.select('.input-sheet__form').append('form')
        .attr('method', 'get');

    form.append('input')
        .attr('type', 'text')
        .attr('name', 'sheetId')
        .attr('value', 'mbafc.json');



    form.append('button')
        .attr('type', 'submit')
        .append('a')
        .attr('class', 'button')
        .text('Build my radar');

    form.append('p').html("<a href='https://info.thoughtworks.com/visualize-your-tech-strategy-guide.html#faq'>Need help?</a>");
}

module.exports = GoogleSheetInput;
