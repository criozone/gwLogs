privat = function() {
    var util, dataGet = false, vcinit=false, areaId = 'main',payment='';
    var init = function (util) {
        this.util = util;
    },
    checkBeforePayment = function () {
        var errorObj = {};
        errorObj.status = 'success';
        return errorObj;
    },
    pay = function () {
        var dataObj = {}, self = this;
        $.each($('input, select, checkbox', $('#'+areaId)).not('[type=button], .noteach'), function () {
            var el = $(this), name = el.attr('name');
            if (name) {
                if (el.attr('data-mask') && el.attr('data-mask') != '') {
                    dataObj[name] = self.util.filterMask(el.val(), el.attr('data-mask'));
                } else {
                    dataObj[name] = el.val();
                }
            }
        });
        dataObj.format = 'json';
        dataObj.payType = 'privat';
        dataObj.typeResponse = 'json';
        dataObj.emailType = 'default';
        self.util.setBusy(true);
        self.util.send(
            '/r3/secure/pay/payment',
            dataObj,
            function (obj) {
                $('<form accept-charset="UTF-8" action="' + obj.response.actionMPI + '" id="mpi-redirect-form" class="hide" method="POST">'
                    +'<input type="hidden" name="data" value="'+obj.response.liqPayData+'" />'
                    +'<input type="hidden" name="signature" value="'+obj.response.liqPaySignature+'" />'
                    + '</form>').appendTo('body');
                $('#mpi-redirect-form').submit();
            }
        );
    },
    payVoucher = function () {
        var dataObj = {}, self = this;
        $.each($('input, select, checkbox', $('#'+areaId)).not('[type=button], .noteach'), function () {
            var el = $(this), name = el.attr('name');
            if (name) {
                dataObj[name] = el.val();
            }
        });
        $.each($('input, select, checkbox', $('#dataVoucher')).not('[type=button], .noteach'), function () {
            var el = $(this), name = el.attr('name');
            if (name) {
                dataObj[name] = el.val();
            }
        });
        dataObj.format = 'json';
        dataObj.payType = 'privatvoucher';
        dataObj.typeResponse = 'json';
        dataObj.emailType = 'default';
        self.util.setBusy(true);
        self.util.send(
            '/r3/secure/pay/payment',
            dataObj,
            function (obj) {
                $('<form accept-charset="UTF-8" action="' + obj.response.actionMPI + '" id="mpi-redirect-form" class="hide" method="POST">'
                    +'<input type="hidden" name="data" value="'+obj.response.liqPayData+'" />'
                    +'<input type="hidden" name="signature" value="'+obj.response.liqPaySignature+'" />'
                    + '</form>').appendTo('body');
                $('#mpi-redirect-form').submit();
            }
        );
    },
    payInvoice = function () {
        var dataObj = {}, self = this;
        $.each($('input, select, checkbox', $('#'+areaId)).not('[type=button], .noteach'), function () {
            var el = $(this), name = el.attr('name');
            if (name) {
                dataObj[name] = el.val();
            }
        });
        dataObj.format = 'json';
        dataObj.payType = 'privatinvoice';
        dataObj.typeResponse = 'json';
        dataObj.emailType = 'default';
        self.util.setBusy(true);
        self.util.send(
            '/r3/secure/pay/payment',
            dataObj,
            function (obj) {
                $('<form accept-charset="UTF-8" action="' + obj.response.actionMPI + '" id="mpi-redirect-form" class="hide" method="POST">'
                    +'<input type="hidden" name="data" value="'+obj.response.liqPayData+'" />'
                    +'<input type="hidden" name="signature" value="'+obj.response.liqPaySignature+'" />'
                    + '</form>').appendTo('body');
                $('#mpi-redirect-form').submit();
            }
        );
    };
    return {
        init:init,
        pay:pay,
        payInvoice:payInvoice,
        payVoucher:payVoucher,
        checkBeforePayment:checkBeforePayment
    }
};
define(['privat'], function () {
    return new privat();
});