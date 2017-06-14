const SheetNotFoundError = require('../../src/exceptions/sheetNotFoundError');
const ExceptionMessages = require('./exceptionMessages');

const ExcelReader = function (filename) {

    var self = {};
    self.Result = 'empty';


    self.Load = function (callback) {
        try {
            self.Result = require('../files/' + filename);

            callback();
        }
        catch (exception) {
            callback(new SheetNotFoundError(ExceptionMessages.SHEET_NOT_FOUND))

        }

    }

    return self;
}

module.exports = ExcelReader;