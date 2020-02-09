version = '2412201901';
require.config({
    'paths': {
        'jquery': '/r3/public/js/jquery/jquery.min',
        'mask': '/r3/js/jquery/plugins/inputmask/jquery-inputmask-bundle_4_0_8.min',
        'card': '/r3/public/resources/pg/js/card.min',
        'pm': '/r3/public/resources/pg/js/pm.min',
        'mp': '/r3/public/resources/pg/js/mp.min',
        'vc': '/r3/public/resources/pg/js/visacheckout.min',
        'token': '/r3/public/resources/pg/js/token.min',
        'qr':'/r3/public/resources/pg/js/qr.min',
        'qrcode':'/r3/public/resources/pg/js/qrcode.min',
        'pmag': '/r3/public/resources/pg/js/pmag.min',
        'util': '/r3/public/resources/pg/js/util.min',
        'truncate': '/r3/public/resources/pg/js/truncate.min',
        'ts': '/r3/public/resources/pg/js/ts.min',
        'privat':'/r3/public/resources/pg/js/privat.min',
        'gpay':'/r3/public/resources/pg/js/gpay.min',
        'applepay':'/r3/public/resources/pg/js/applepay.min',
        'stock':'/r3/public/resources/pg/js/stock.min',
        'payeeparams':'/r3/public/resources/pg/js/payeeparams.min',
        'pml':'/r3/public/resources/pg/js/pml.min',
        'autopay':'/r3/public/resources/pg/js/autopay.min',
        'ksm':'/r3/public/resources/pg/js/ksm.min',
        'installment':'/r3/public/resources/pg/js/installment'
    },
    'urlArgs': 'v='+version,
    'shim': {
        'mask': {
            deps: ["jquery"],
            exports: "inputmask"
        },
        'ts': {
            deps: ["jquery"],
            exports: "ts"
        }
    }
});
require(
    [
        'jquery',
        'mask',
        'card',
        'pm',
        'mp',
        'vc',
        'token',
        'privat',
        'gpay',
        'applepay',
        'stock',
        'payeeparams',
        'pml',
        'qr',
        'qrcode',
        'pmag',
        'util',
        'autopay',
        'ksm',
        'installment',
        'truncate',
        'actions',
        'ts'
    ],
    function(jquery, mask, card, pm, mp, vc, token, privat, gpay, applepay, stock, payeeparams, pml, qr, qrcode, pmag, util, autopay, ksm, installment, ts) {
        var app = {
            "actionPay":"",
            "accountTypePayment": $('#accountFormStock').length ? 'payaccountstock' : 'payaccount',
            "vcinit":false,
            "submitPayCard":true,
            "init": function init() {
                util.init(pmag,pml,autopay);
                util.disableAutofill();
                card.init(util);
                mp.init(util);
                pm.init(util);
                vc.init(util);
                token.init(util);
                qr.init(util, qrcode);
                privat.init(util);
                stock.init(util);
                payeeparams.init(util);
                autopay.init(util);
                ksm.init(util);
                installment.init(util);
                if (window.ApplePaySession && $('#applepaysection').length) {
                    try {
                        applepay.init(util);
                    } catch (e) {
                        console.error(e);
                    }
                } else{
                    if ($('#google-button').length) {
                        $('#gpaysection').removeClass('hide');
                        try {
                            gpay.init(util);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
                util.sl('pageloaded?type=start');
                app.submitForms();
                app.keysHandler();
                app.actions();
                app.initForms();
                app.truncatePayeeMessage();
                app.tsInit();
                if (window.parent) {
                    app.listenMessage();
                }
            },
            "listenMessage":function listenMessage() {
                var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent",
                    eventer = window[eventMethod],
                    messageEvent = eventMethod == "attachEvent"  ? "onmessage" : "message"
                ;
                try {
                    eventer(messageEvent, function (e) {
                        var key = e.message ? "message" : "data";
                        var data = e[key];
                        if (e[key].method == "focusInFrame") {
                            var inputV = $('body').find('*').filter(':input:visible:first');
                            inputV.focus();
                        }
                    }, false);
                } catch (e) {
                    console.error(e);
                }
            },
            "keysHandler":function keysHandler() {
                $(document).on(
                'keydown', function(event) {
                    if (event.key == "Escape" && window.parent) {
                        var obj = {};
                        obj.method = 'closeframe';
                        try {
                            window.parent.postMessage(obj, "*");
                        } catch (e) {
                            console.log(e);
                        }
                    }
                });
            },
            "tsInit":function tsInit() {
                if ($('#isInvoiceHasTime').length > 0 && $('#isInvoiceHasTime').val() == 'Y') {
                    try {
                        $('.demo1').dsCountDown({
                            endDate: new Date($('#exptime').val()*1000),
                            elemSelDays: $('#isDays').val() != 'N' ? '' : true,
                            elemSelHours: $('#isHours').val() != 'N' ? '' : true,
                            titleDays: $('#titleDays').val(),
                            titleHours: $('#titleHours').val(),
                            titleMinutes: $('#titleMinutes').val(),
                            titleSeconds: $('#titleSeconds').val(),
                            onFinish: function () {
                                console.error('finish');
                            }
                        });
                        $('.pg-card__flow').css({'padding':'0px 0px 0px'});
                    } catch (e) {
                        console.log(e);
                    }
                }
            },
            "truncatePayeeMessage": function truncatePayeeMessage() {
                if ($('#payee-message').length) {
                    $('#payee-message').removeClass('hide');
                    if($('#payee-message').is(":visible"))
                    {
                        $('#payee-message').truncate({
                            lines: 3,
                            position: "end",
                            showMore: '&nbsp;&nbsp;<span data-action="show-more" class="pg-text-c--darker pg-text--bold action" style="cursor: pointer;">Показати все</span>',
                            showLess: '&nbsp;&nbsp;<span data-action="show-less" class="pg-text-c--darker pg-text--bold action" style="cursor: pointer;">Згорнути</span>',
                        });
                    }
                }
            },
            "initForms" : function initForms() {
                var self = this;
                if ($('#pg-portmone-box-id').is(':visible')) {
                    $('#tab-id__portmone-box--login').addClass('hide');
                    $('#tab-id__portmone-box--forgot-pass').addClass('hide');
                    $('#tab-id__portmone-box--sign').addClass('hide');
                    $.when(pm.checkLogin()).then(function( data, textStatus, jqXHR ) {
                        pm.getAccounts();
                    });
                } else if ($('#pg-masterpass-box-id').is(':visible')) {
                    mp.checkSessionGc();
                    self.actionPay = 'login-mc';
                } else if ($('#pg-visacheckout-box-id').is(':visible')) {
                    vc.checkVisaData();
                    self.actionPay = 'visacheckout';
                } else if ($('#pg-qr-box-id').is(':visible')) {
                    qr.setQr();
                    self.actionPay = 'qr';
                }
            },
            "verification": function verification() {
                util.verification();
            },
            "verificationksm":function verificationksm() {
                util.verificationksm();
            },
            "showErrors": function showErrors(errorValidate) {
                for (key in errorValidate) {
                    var objError = errorValidate[key];
                    if (objError.timeout) {
                        $(objError['id']).parent().find('.pg-input-error').text(objError['error']);
                        $(objError['id']).parent().addClass('pg-has-error');
                        var funcCall = function (id) {
                            $(id).parent().find('.pg-input-error').text('');
                            $(id).parent().removeClass('pg-has-error');
                        };
                        window.setTimeout(funcCall, objError.timeout, objError['id']);
                    } else if (!objError.timeout) {
                        $(objError['id']).parent().addClass('pg-has-error');
                        $(objError['id']).parent().find('.pg-input-error').text(objError['error']);
                    }
                }
            },
            "submitForms": function () {
                var self = this;
                $('form#cardForm').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'card';
                        card.getCommission();
                    }
                });
                $('form#cardFormStock').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'cardstock';
                        card.getCommissionStock();
                    }
                });
                $('form#cardFormInvoice').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'cardPaymentInvoice';
                        card.getCommissionInvoice();
                    }
                });
                $('form#cardFormOnToken').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'cardontoken';
                        card.getCommissionOnToken();
                    }
                });
                $('form#ksmForm').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        util.ksmrequestallow = true;
                        self.actionPay = 'ksm';
                        ksm.getCommission();
                    }
                });
                $('form#ksmFormInvoice').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        util.ksmrequestallow = true;
                        self.actionPay = 'ksminvoice';
                        ksm.getCommissionInvoice();
                    }
                });
                $('form#ksmFormStock').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        util.ksmrequestallow = true;
                        self.actionPay = 'ksmstock';
                        ksm.getCommissionStock();
                    }
                });
                $('#verificationFormKsm').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        util.verificationksm();
                    }
                });
                $('form#privatForm').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'privat';
                        privat.pay();
                    }
                });
                $('form#privatFormInvoice').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'privatinvoice';
                        privat.pay();
                    }
                });
                $('form#createOnlyTokenFormP2P').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'createtokenonlyp2p';
                        token.createTokenOnlyP2P();
                    }
                });
                $('form#verificationForm').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        app.verification();
                    }
                });
                $('form#loginMasterpass').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        mp.checkMpGc();
                    }
                });
                $('form#loginPortmone').submit(function () {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        $.when(pm.login()).then(function( data, textStatus, jqXHR ) {
                            pm.getAccounts();
                        });
                    }
                });
                $('form#accountForm').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'account';
                        if (pm.getAccountTypePayment() == 'payaccount') {
                            app.accountTypePayment = 'payaccount';
                            var errorValidate = pm.checkAccountBeforePayment('accountForm');
                            if (errorValidate.status == 'error') {
                                app.showErrors(errorValidate);
                                return;
                            }
                            pm.getCommission();
                            $('form#accountForm').data('submitted', true);
                        } else if (pm.getAccountTypePayment() == 'addcardtoaccount') {
                            app.accountTypePayment = 'addcardtoaccount';
                            var errorValidate = pm.checkCardBeforePayment('accountForm');
                            if (errorValidate.status == 'error') {
                                app.showErrors(errorValidate);
                                return;
                            }
                            pm.getCommissionCard();
                        }
                    }
                });
                $('form#accountTokenForm').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'accountontoken';
                        if (pm.getAccountTypePayment() == 'payaccount') {
                            app.accountTypePayment = 'payaccountontoken';
                            var errorValidate = pm.checkAccountBeforePayment('accountTokenForm');
                            if (errorValidate.status == 'error') {
                                app.showErrors(errorValidate);
                                return;
                            }
                            pm.getCommissionOnToken();
                            $('form#accountForm').data('submitted', true);
                        } else if (pm.getAccountTypePayment() == 'addcardtoaccount') {
                            app.accountTypePayment = 'addcardtoaccountontoken';
                            var errorValidate = pm.checkCardBeforePayment('accountTokenForm');
                            if (errorValidate.status == 'error') {
                                app.showErrors(errorValidate);
                                return;
                            }
                            pm.getCommissionCardOnToken();
                        }
                    }
                });
                $('form#accountFormStock').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'accountstock';
                        if (pm.getAccountTypePayment() == 'payaccount') {
                            app.accountTypePayment = 'payaccountstock';
                            var errorValidate = pm.checkAccountBeforePayment('accountFormStock');
                            if (errorValidate.status == 'error') {
                                app.showErrors(errorValidate);
                                return;
                            }
                            pm.getCommissionStock();
                            $('form#accountFormStock').data('submitted', true);
                        } else if (pm.getAccountTypePayment() == 'addcardtoaccount') {
                            app.accountTypePayment = 'addcardtoaccountstock';
                            var errorValidate = pm.checkCardBeforePayment('accountFormStock');
                            if (errorValidate.status == 'error') {
                                app.showErrors(errorValidate);
                                return;
                            }
                            pm.getCommissionCardStock();
                        }
                    }
                });
                $('form#accountFormInvoice').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'account';
                        if (pm.getAccountTypePayment() == 'payaccount') {
                            app.accountTypePayment = 'payaccount';
                            var errorValidate = pm.checkAccountBeforePayment('accountFormInvoice');
                            if (errorValidate.status == 'error') {
                                app.showErrors(errorValidate);
                                return;
                            }
                            pm.getCommissionInvoice();
                            $('form#accountFormInvoice').data('submitted', true);
                        } else if (pm.getAccountTypePayment() == 'addcardtoaccount') {
                            app.accountTypePayment = 'addcardtoaccount';
                            var errorValidate = pm.checkCardBeforePayment('accountFormInvoice');
                            if (errorValidate.status == 'error') {
                                app.showErrors(errorValidate);
                                return;
                            }
                            pm.getCommissionCardInvoice();
                        }
                    }
                });
                $('form#masterpassForm').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'masterpass-gc';
                        mp.getCommission();
                    }
                });
                $('form#formToken').submit(function(e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'token';
                        token.getCommission();
                    }
                });
                $('form#formTokenInvoice').submit(function(e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'token';
                        token.getCommissionInvoice();
                    }
                });
                $('form#createOnlyTokenForm').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'createtokenonly';
                        token.createTokenOnly();
                    }
                });
                $('form#successPaymentForm').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        $('#successPaymentForm #success__user-email').blur();
                        util.sendEmailAfterPayment();
                    }
                });
                $('form#signPortmone').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        pm.signup();
                    }
                });
                $('form#rememberPassword').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        pm.rememberPassword();
                    }
                });
                $('form#formCardVisaCheckout').submit(function (e) {
                    if (util.submitAction === true) {
                        e.preventDefault();
                    } else {
                        self.actionPay = 'visacheckoutwithcvv';
                        vc.getCommission();
                    }
                });
            },
            "enterForms": function () {
                var self = this;
                $('#dataPayee').on('keypress',function (e) {
                    if (e.which == 13) {
                        var errorValidate = payeeparams.checkDataPayee();
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        payeeparams.moveData();
                        $('#payeeParamsBlock').hide();
                        $('#sectionPaymentBlock').fadeIn()
                    }
                });
                $('#dataVoucher').on('keypress',function (e) {
                    if (e.which == 13) {
                        var errorValidate = stock.checkDataStock();
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        stock.moveEmail();
                        $('#voucherBlock').hide();
                        $('#sectionPaymentBlock').fadeIn();
                    }
                });
                $('form#ksmForm').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = ksm.checkCardBeforePayment('ksmForm');
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#ksmForm').submit();
                    }
                });
                $('form#ksmFormInvoice').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = ksm.checkCardBeforePayment('ksmFormInvoice');
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#ksmFormInvoice').submit();
                    }
                });
                $('form#ksmFormStock').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = ksm.checkCardBeforePayment('ksmFormStock');
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#ksmFormStock').submit();
                    }
                });
                $('form#verificationFormKsm').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        if ($('#vcode-input-ks').val().length < '5') {
                            $('#vcode-input-ks').parent().addClass('pg-has-error');
                            $('.pg-input-error').text(messages.verifyNeedCode);
                            util.sl('verificationbuttonclick/?form=verification','INVALID CODE LENGTH');
                        } else {
                            $('#vcode-input-ks').parent().removeClass('pg-has-error');
                            $('.pg-input-error').text();
                            util.sl('verificationbuttonclick/?form=verification','SUCCESS');
                            $('form#verificationFormKsm').submit();
                        }
                    }
                });
                $('form#cardForm').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = card.checkCardBeforePayment('cardForm');
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#cardForm').submit();
                    }
                });
                $('form#cardFormOnToken').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = card.checkCardBeforePayment('cardFormOnToken');
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#cardFormOnToken').submit();
                    }
                });
                $('form#cardFormInvoice').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = card.checkCardBeforePayment('cardFormInvoice');
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#cardFormInvoice').submit();
                    }
                });
                $('form#cardFormStock').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = card.checkCardBeforePayment('cardFormStock');
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#cardFormStock').submit();
                    }
                });
                $('form#createOnlyTokenForm').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = token.checkCardBeforeTokenCreate('createOnlyTokenForm');
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#createOnlyTokenForm').submit();
                    }
                });
                $('form#createOnlyTokenFormP2P').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = token.checkCardBeforeTokenCreate('createOnlyTokenForm');
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#createOnlyTokenFormP2P').submit();
                    }
                });
                $('#verificationForm').on('keypress', function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        if ($('#vcode-input').val().length != '6') {
                            $('#vcode-input').parent().addClass('pg-has-error');
                            $('.pg-input-error').text(messages.verifyNeedCode);
                        } else {
                            $('#vcode-input').parent().removeClass('pg-has-error');
                            $('.pg-input-error').text();
                            $('form#verificationForm').submit();
                        }
                    }
                });
                $('form#loginMasterpass').on('keypress', function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = mp.checkFormBeforeLogin();
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#loginMasterpass').submit();
                    }
                });
                $('form#loginPortmone').on('keypress', function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = pm.checkFormBeforeLogin();
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#loginPortmone').submit();
                    }
                });
                $('form#accountForm').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        $('form#accountForm').submit();
                    }
                });
                $('form#accountTokenForm').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        $('form#accountTokenForm').submit();
                    }
                });
                $('form#accountFormStock').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        $('form#accountFormStock').submit();
                    }
                });
                $('#accountFormInvoice').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        $('form#accountFormInvoice').submit();
                    }
                });
                $('form#masterpassForm').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        $('form#masterpassForm').submit();
                    }
                });
                $('form#formToken').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = token.checkTokenBeforePayment();
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#formToken').submit();
                    }
                });
                $('form#formTokenInvoice').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = token.checkTokenBeforePayment();
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#formTokenInvoice').submit();
                    }
                });
                $('form#successPaymentForm').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = util.checkEmailBeforeSend();
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#successPaymentForm').submit();
                    }
                });
                $('form#signPortmone').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = pm.checkSignup();
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#signPortmone').submit();
                    }
                });
                $('form#rememberPassword').on('keypress', function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = util.checkEmailPasswordBeforeSend();
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('form#rememberPassword').submit();
                    }
                });
                $('#formCardVisaCheckout').on('keypress',function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        var errorValidate = vc.checkVcBefore();
                        if (errorValidate.status == 'error') {
                            app.showErrors(errorValidate);
                            return;
                        }
                        $('#formCardVisaCheckout').submit();
                    }
                });
            },
            "actions": function actions() {
                var self = this, contElement = $('body');
                self.enterForms();
                if (contElement.length) {
                    contElement.on('click', '.action', function(e) {
                        var el = $(this), action = el.data('action');
                        e.preventDefault();
                        switch (action) {
                            case "ksmPayment":
                                var errorValidate = ksm.checkCardBeforePayment('ksmForm');
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'ksm';
                                    util.ksmrequestallow = true;
                                    ksm.getCommission();
                                }
                                break;
                            case "ksmPaymentInvoice":
                                var errorValidate = ksm.checkCardBeforePayment('ksmFormInvoice');
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'ksminvoice';
                                    util.ksmrequestallow = true;
                                    ksm.getCommissionInvoice();
                                }
                                break;
                            case "ksmPaymentStock":
                                var errorValidate = ksm.checkCardBeforePayment('ksmFormStock');
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'ksmstock';
                                    util.ksmrequestallow = true;
                                    ksm.getCommissionStock();
                                }
                                break;
                            case "show-more":
                                $('#payee-message').truncate('expand');
                                break;
                            case "show-less":
                                $('#payee-message').truncate('collapse');
                                break;
                            case "confirmQrPayment":
                                qr.checkQrShopBill();
                                self.actionPay = 'qr';
                                break;
                            case "getQR":
                                qr.setQr();
                                self.actionPay = 'qr';
                                break;
                            case "visacheckout":
                                vc.checkVisaData();
                                self.actionPay = 'visacheckout';
                                break;
                            case "openEmailInput":
                                var opacityBlock = $('#pg-success__flow #pg-success__flow__email-box-id').css('opacity');
                                if (opacityBlock == 1) {
                                    $('#pg-success__flow__email-box-id').removeClass('pg-open');
                                } else if (opacityBlock == 0) {
                                    $('#pg-success__flow__email-box-id').addClass('pg-open');
                                }
                                break;
                            case "showForgotPassword":
                                $('#tab-id__portmone-box--forgot-pass').removeClass('hide');
                                $('#tab-id__portmone-box--login').addClass('hide');
                                break;
                            case "addNewCardPortmone":
                                $('#portmone-box-id__card-select').find('#exp_cvv_block').addClass('hide');
                                $('#portmone-box-id__card-input').removeClass('hide');
                                $('#portmone-box-btn__show-pay-other-card').addClass('hide');
                                app.accountTypePayment = 'addcardtoaccount';
                                break;
                            case "addNewCardPortmoneStock":
                                $('#portmone-box-id__card-select').addClass('hide');
                                $('#portmone-box-id__card-input').removeClass('hide');
                                $('#portmone-box-btn__show-pay-other-card').addClass('hide');
                                break;
                            case "signup":
                                var errorValidate = pm.checkSignup();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                pm.signup();
                                break;
                            case "showSign":
                                $('#tab-id__portmone-box--login').addClass('hide');
                                $('#tab-id__portmone-box--forgot-pass').addClass('hide');
                                $('#tab-id__portmone-box--sign').removeClass('hide');
                                break;
                            case "showLogin":
                                $('#tab-id__portmone-box--login').removeClass('hide');
                                $('#tab-id__portmone-box--forgot-pass').addClass('hide');
                                $('#tab-id__portmone-box--sign').addClass('hide');
                                break;
                            case "okErrorSignup":
                                $('#pg-error__flow_signup').addClass('hide');
                                $('#paymentBlock').removeClass('hide');
                                break;
                            case "okSuccessSignup":
                                $('#pg-success__flow_signup').addClass('hide');
                                $('#paymentBlock').removeClass('hide');
                                $('#tab-id__portmone-box--sign').addClass('hide');
                                $.when(pm.checkLogin()).then(function( data, textStatus, jqXHR ) {
                                    pm.getAccounts();
                                });
                                break;
                            case "okErrorForgotPassword":
                                $('#pg-error__flow_remember_password').addClass('hide');
                                $('#tab-id__portmone-box--forgot-pass').removeClass('hide');
                                $('#paymentBlock').removeClass('hide');
                                break;
                            case "okSuccessForgotPassword":
                                $('#pg-success__flow_remember_password').addClass('hide');
                                $('#tab-id__portmone-box--forgot-pass').addClass('hide');
                                $('#paymentBlock').removeClass('hide');
                                $('#tab-id__portmone-box--login').removeClass('hide');
                                break;
                            case "rememberPassword":
                                var errorValidate = util.checkEmailPasswordBeforeSend();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                pm.rememberPassword();
                                break;
                            case "okErrorEmailSend":
                                $('#pg-success__flow').removeClass('hide');
                                $('#pg-error__flow_emailsend').addClass('hide');
                                break;
                            case "okErrorRequest":
                                if (self.actionPay == 'card') {
                                    $('#pg-error__flow_commission').addClass('hide');
                                    $('#pg-error__flow_request').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                    $('#cardForm #single_portmone_pay_cvv2').val('');
                                } else if (self.actionPay == 'account') {
                                    $('#pg-error__flow_commission').addClass('hide');
                                    $('#pg-error__flow_request').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                    $('#cardForm #portmone-pay__select-card-cvv').val('');
                                } else if (self.actionPay == 'addcardtoaccount') {
                                    $('#pg-error__flow_commission').addClass('hide');
                                    $('#pg-error__flow_request').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                    $('#cardForm #portmone-pay__card-cvv').val('');
                                }
                                else if(self.actionPay == 'masterpass-gc') {
                                    $('#pg-error__flow_commission').addClass('hide');
                                    $('#pg-error__flow_request').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                } else if(self.actionPay == 'token') {
                                    $('#pg-error__flow_commission').addClass('hide');
                                    $('#pg-error__flow_request').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                    $('#formToken #pay__token-card-cvv').val('');
                                } else {
                                    $('#pg-error__flow_commission').addClass('hide');
                                    $('#pg-error__flow_request').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                }
                                break;
                            case "okCommissionError":
                                if (self.actionPay == 'card') {
                                    $('#pg-error__flow_commission').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                    $('#cardForm #single_portmone_pay_cvv2').val('');
                                } else if (self.actionPay == 'account') {
                                    $('#pg-error__flow_commission').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                    $('#cardForm #portmone-pay__select-card-cvv').val('');
                                } else if (self.actionPay == 'addcardtoaccount') {
                                    $('#pg-error__flow_commission').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                    $('#cardForm #portmone-pay__card-cvv').val('');
                                }
                                else if(self.actionPay == 'masterpass-gc') {
                                    $('#pg-error__flow_commission').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                } else if(self.actionPay == 'token') {
                                    $('#pg-error__flow_commission').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                    $('#formToken #pay__token-card-cvv').val('');
                                } else {
                                    $('#pg-error__flow_commission').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                }
                                break;
                            case "sendEmailAfterPayment":
                                var errorValidate = util.checkEmailBeforeSend();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                util.sendEmailAfterPayment();
                                break;
                            case "exitPortmone":
                                pm.exit(util);
                                break;
                            case "payGC":
                                if (util.submitAction === false) {
                                    self.actionPay = 'masterpass-gc';
                                    mp.getCommission();
                                }
                                break;
                            case "payGCInvoice":
                                if (util.submitAction === false) {
                                    self.actionPay = 'masterpass-gc-invoice';
                                    mp.getCommissionInvoice();
                                }
                                break;
                            case "payGCStock":
                                if (util.submitAction === false) {
                                    self.actionPay = 'masterpass-gc-stock';
                                    mp.getCommissionStock();
                                }
                                break;
                                break;
                            case "cancelCommission":
                                $('#pg-commission-box-id').addClass('hide');
                                $('#paymentBlock').removeClass('hide');
                                break;
                            case "gcBox":
                                mp.checkSessionGc();
                                break;
                            case "checkAccounts":
                                app.accountTypePayment = 'payaccount';
                                pm.accountsExist = false;
                                $('#portmone-box-id__card-input').addClass('hide');
                                $('#portmone-box-btn__show-pay-other-card').removeClass('hide');
                                $.when(pm.checkLogin()).then(function( data, textStatus, jqXHR ) {
                                    pm.getAccounts();
                                });
                                break;
                            case "checkAccountsStock":
                                app.accountTypePayment = 'payaccountstock';
                                pm.accountsExist = false;
                                $('#portmone-box-id__card-input').addClass('hide');
                                $('#portmone-box-btn__show-pay-other-card').removeClass('hide');
                                $.when(pm.checkLogin()).then(function( data, textStatus, jqXHR ) {
                                    pm.getAccounts();
                                });
                                break;
                            case "paymentPortmoneOnToken":
                                if (util.submitAction === false) {
                                    self.actionPay = 'accountontoken';
                                    if (pm.getAccountTypePayment() == 'payaccount') {
                                        self.accountTypePayment = 'payaccountontoken';
                                        var errorValidate = pm.checkAccountBeforePayment('accountTokenForm');
                                        if (errorValidate.status == 'error') {
                                            app.showErrors(errorValidate);
                                            return;
                                        }
                                        pm.getCommissionOnToken();
                                    } else if (pm.getAccountTypePayment() == 'addcardtoaccount') {
                                        self.accountTypePayment = 'addcardtoaccountontoken';
                                        var errorValidate = pm.checkCardBeforePayment('accountTokenForm');
                                        if (errorValidate.status == 'error') {
                                            app.showErrors(errorValidate);
                                            return;
                                        }
                                        pm.getCommissionCardOnToken();
                                    }
                                }
                                break;
                            case "paymentPortmone":
                                if (util.submitAction === false) {
                                    self.actionPay = 'account';
                                    if (pm.getAccountTypePayment() == 'payaccount') {
                                        self.accountTypePayment = 'payaccount';
                                        var errorValidate = pm.checkAccountBeforePayment('accountForm');
                                        if (errorValidate.status == 'error') {
                                            app.showErrors(errorValidate);
                                            return;
                                        }
                                        pm.getCommission();
                                    } else if (pm.getAccountTypePayment() == 'addcardtoaccount') {
                                        self.accountTypePayment = 'addcardtoaccount';
                                        var errorValidate = pm.checkCardBeforePayment('accountForm');
                                        if (errorValidate.status == 'error') {
                                            app.showErrors(errorValidate);
                                            return;
                                        }
                                        pm.getCommissionCard();
                                    }
                                }
                                break;
                            case "paymentPortmoneStock":
                                if (util.submitAction === false) {
                                    self.actionPay = 'accountstock';
                                    if (pm.getAccountTypePayment() == 'payaccount') {
                                        self.accountTypePayment = 'payaccountstock';
                                        var errorValidate = pm.checkAccountBeforePayment('accountFormStock');
                                        if (errorValidate.status == 'error') {
                                            app.showErrors(errorValidate);
                                            return;
                                        }
                                        pm.getCommissionStock();
                                    } else if (pm.getAccountTypePayment() == 'addcardtoaccount') {
                                        self.accountTypePayment = 'addcardtoaccountstock';
                                        var errorValidate = pm.checkCardBeforePayment('accountFormStock');
                                        if (errorValidate.status == 'error') {
                                            app.showErrors(errorValidate);
                                            return;
                                        }
                                        pm.getCommissionCardStock();
                                    }
                                }
                                break;
                            case "portmoneBox":
                                $('#tab-id__portmone-box--login').addClass('hide');
                                $('#tab-id__portmone-box--forgot-pass').addClass('hide');
                                $('#tab-id__portmone-box--sign').addClass('hide');
                                $.when(pm.checkLogin()).then(function( data, textStatus, jqXHR ) {
                                    pm.getAccounts();
                                });
                                break;
                            case "okErrorLogin":
                                $('#pg-error__flow_login').addClass('hide');
                                $('#paymentBlock').removeClass('hide');
                                break;
                            case "okErrorLoginMasterpass":
                                $('#pg-error__flow_login_masterpass').addClass('hide');
                                $('#paymentBlock').removeClass('hide');
                                break;
                            case "exitMasterpass":
                                mp.exit();
                                break;
                            case "loginPortmone":
                                var errorValidate = pm.checkFormBeforeLogin();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                $.when(pm.login(util)).then(function( data, textStatus, jqXHR ) {
                                    pm.getAccounts(util);
                                });
                                break;
                            case "paymentConfirm":
                                $('#pg-commission-box-id').addClass('hide');
                                if (util.submitAction === false) {
                                    if (self.actionPay == 'card') {
                                        card.pay();
                                    } else if (self.actionPay == 'account') {
                                        if (app.accountTypePayment == 'payaccount') {
                                            pm.pay();
                                        } else if (app.accountTypePayment == 'addcardtoaccount') {
                                            pm.payAddCard();
                                        }
                                    } else if(self.actionPay == 'masterpass-gc') {
                                        mp.pay();
                                    } else if (self.actionPay == 'masterpass-gc-stock') {
                                        mp.payStock();
                                    }
                                    else if (self.actionPay == 'token') {
                                        token.pay();
                                    } else if(self.actionPay == 'tokenInvoice') {
                                        token.payInvoice();
                                    } else if (self.actionPay == 'visacheckoutwithcvv') {
                                        vc.payWithCvv();
                                    } else if (self.actionPay == 'cardPaymentInvoice') {
                                        card.payInvoice();
                                    } else if (self.actionPay == 'accountInvoice') {
                                        if (app.accountTypePayment == 'payaccount') {
                                            pm.payInvoice();
                                        } else if (app.accountTypePayment == 'addcardtoaccount') {
                                            pm.payAddCardInvoice();
                                        }
                                    } else if (self.actionPay == 'accountontoken') {
                                        if (app.accountTypePayment == 'payaccountontoken') {
                                            pm.payAccountOnToken();
                                        } else if (app.accountTypePayment == 'addcardtoaccountontoken') {
                                            pm.payAddCardOnToken();
                                        }
                                    }
                                    else if (self.actionPay == 'masterpass-gc-invoice') {
                                        mp.payInvoice();
                                    } else if (self.actionPay == 'visacheckoutwithcvvinvoice') {
                                        vc.payWithCvvInvoice();
                                    } else if (self.actionPay == 'cardstock') {
                                        card.payStock();
                                    } else if (self.actionPay == 'accountstock') {
                                        if (app.accountTypePayment == 'payaccountstock') {
                                            pm.payStock();
                                        } else if (app.accountTypePayment == 'addcardtoaccountstock') {
                                            pm.payAddCardStock();
                                        }
                                    } else if (app.actionPay ==  'visacheckoutwithcvvvoucher') {
                                        vc.payWithCvvStock();
                                    } else if (app.actionPay ==  'ksm') {
                                        ksm.pay();
                                    } else if (app.actionPay ==  'ksminvoice') {
                                        ksm.payInvoice();
                                    } else if (app.actionPay ==  'ksmstock') {
                                        ksm.payStock();
                                    } else if (app.actionPay == 'cardontoken') {
                                        card.payOnToken();
                                    }
                                }
                                break;
                            case "loginMasterpass":
                                var errorValidate = mp.checkFormBeforeLogin();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                self.actionPay = 'login-mc';
                                mp.checkMpGc();
                                break;
                            case "okErrorRequestMasterpass":
                                $('#pg-error__flow_request_masterpass').addClass('hide');
                                $('#paymentBlock').removeClass('hide');
                                break;
                            case "createTokenOnly":
                                var errorValidate = token.checkCardBeforeTokenCreate('createOnlyTokenForm');
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'createtokenonly';
                                    token.createTokenOnly();
                                }
                                break;
                            case "createTokenOnlyP2P":
                                var errorValidate = token.checkCardBeforeTokenCreate('createOnlyTokenForm');
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'createtokenonlyp2p';
                                    token.createTokenOnlyP2P();
                                }
                                break;
                            case "cardPayment":
                                var errorValidate = card.checkCardBeforePayment('cardForm');
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'card';
                                    card.getCommission();
                                }
                                break;
                            case "cardPaymentOnToken":
                                var errorValidate = card.checkCardBeforePayment('cardFormOnToken');
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'cardontoken';
                                    card.getCommissionOnToken();
                                }
                                break;
                            case "cardPaymentStock":
                                var errorValidate = card.checkCardBeforePayment('cardFormStock');
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'cardstock';
                                    card.getCommissionStock();
                                }
                                break;
                            case "privatPayment":
                                var errorValidate = privat.checkBeforePayment();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'privat';
                                    privat.pay();
                                }
                                break;
                            case "privatPaymentInvoice":
                                var errorValidate = privat.checkBeforePayment();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'privatinvoice';
                                    privat.payInvoice();
                                }
                                break;
                            case "privatPaymentVoucher":
                                var errorValidate = privat.checkBeforePayment();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'privatvoucher';
                                    privat.payVoucher();
                                }
                                break;
                            case "cardPaymentInvoice":
                                var errorValidate = card.checkCardBeforePayment('cardFormInvoice');
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'cardPaymentInvoice';
                                    card.getCommissionInvoice();
                                }
                                break;
                            case "paymentPortmoneInvoice":
                                if (util.submitAction === false) {
                                    self.actionPay = 'accountInvoice';
                                    if (pm.getAccountTypePayment() == 'payaccount') {
                                        app.accountTypePayment = 'payaccount'
                                        var errorValidate = pm.checkAccountBeforePayment('accountFormInvoice');
                                        if (errorValidate.status == 'error') {
                                            app.showErrors(errorValidate);
                                            return;
                                        }
                                        pm.getCommissionInvoice();
                                    } else if (pm.getAccountTypePayment() == 'addcardtoaccount') {
                                        app.accountTypePayment = 'addcardtoaccount';
                                        var errorValidate = pm.checkCardBeforePayment('accountFormInvoice');
                                        if (errorValidate.status == 'error') {
                                            app.showErrors(errorValidate);
                                            return;
                                        }
                                        pm.getCommissionCardInvoice();
                                    }
                                }
                                break;
                            case "okErrorRequestUnknownstatus":
                                location.reload();
                                break;
                            case "repeatPayment":
                                if (self.actionPay == 'card') {
                                    $('#pg-error__flow').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                    $('#cardForm #single_portmone_pay_cvv2').val('');
                                } else if (self.actionPay == 'account' && app.accountTypePayment == 'payaccount') {
                                    $('#pg-error__flow').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                    $('#accountForm #portmone-pay__select-card-cvv').val('');
                                } else if (self.actionPay == 'account' && self.accountTypePayment == 'addcardtoaccount') {
                                    $('#pg-error__flow').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                    $('#accountForm #portmone-pay__card-cvv').val('');
                                    app.accountTypePayment = 'payaccount';
                                    pm.accountsExist = false;
                                    $('#portmone-box-id__card-input').addClass('hide');
                                    $('#portmone-box-btn__show-pay-other-card').removeClass('hide');
                                    $.when(pm.checkLogin()).then(function( data, textStatus, jqXHR ) {
                                        pm.getAccounts();
                                    });
                                } else if (self.actionPay == 'qr') {
                                    location.reload();
                                }
                                else if(self.actionPay == 'masterpass-gc') {
                                    $('#pg-error__flow').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                } else if(self.actionPay == 'token' || self.actionPay == 'tokenInvoice') {
                                    $('#pg-error__flow').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                    $('#formToken #pay__token-card-cvv').val('');
                                } else if(self.actionPay == 'visacheckoutwithcvv') {
                                    $('#pg-error__flow').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                    $('#formCardVisaCheckout #pay__visacheckout-card-cvv').val('');
                                } else if (self.actionPay == 'privatpartsintstallment') {
                                    $('#pg-error__flow').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                    $('#paymentBlock').fadeIn();
                                }
                                else {
                                    $('#pg-error__flow').addClass('hide');
                                    $('#paymentBlock').removeClass('hide');
                                }
                                break;
                            case "verification":
                                if ($('#vcode-input').val().length != '6') {
                                    $('#vcode-input').parent().addClass('pg-has-error');
                                    $('.pg-input-error').text(messages.verifyNeedCode);
                                    util.sl('verificationbuttonclick/?form=verification','INVALID CODE LENGTH');
                                } else {
                                    $('#vcode-input').parent().removeClass('pg-has-error');
                                    $('.pg-input-error').text();
                                    util.sl('verificationbuttonclick/?form=verification','SUCCESS');
                                    app.verification();
                                }
                                break;
                            case "verificationks":
                                if ($('#vcode-input-ks').val().length < '5') {
                                    $('#vcode-input-ks').parent().addClass('pg-has-error');
                                    $('.pg-input-error').text(messages.verifyNeedCode);
                                    util.sl('verificationbuttonclick/?form=verification','INVALID CODE LENGTH');
                                } else if ($('#vcode-input-ks').val().length > '5') {
                                    $('#vcode-input-ks').parent().addClass('pg-has-error');
                                    $('.pg-input-error').text(messages.verifyNeedCode);
                                    util.sl('verificationbuttonclick/?form=verification','INVALID CODE LENGTH');
                                }
                                else if ($('#vcode-input-ks').val().length == '5') {
                                    $('#vcode-input-ks').parent().removeClass('pg-has-error');
                                    $('.pg-input-error').text();
                                    util.sl('verificationbuttonclick/?form=verification','SUCCESS');
                                    app.verificationksm();
                                }
                                break;
                            case "returnToMerchant":
                                if ($('#clientNotificationType').length && $('#clientNotificationType').val() == "GET") {
                                    window.location.href = $(this).data('url');
                                } else {
                                    var form = util.getFormReturn($(this).data('url'), $(this).data('shopordernumber'), $(this).data('error'));
                                    form.appendTo('body');
                                    form.submit();
                                }
                                break;
                            case "returnToMerchantFrame":
                                var obj = {};
                                obj.method = 'closeframe';
                                try {
                                    window.parent.postMessage(obj, "*");
                                } catch (e) {
                                    console.log(e);
                                }
                                break;
                            case "cancelVerify":
                                $('#pg-verification__flow').addClass('hide');
                                $('#pg-ks-verification__flow').addClass('hide');
                                $('#paymentBlock').removeClass('hide');
                                break;
                            case "cancelVerifyOffer":
                                $('#pg-verification_offer__flow').addClass('hide');
                                $('#paymentBlock').removeClass('hide');
                                break;
                            case "paymentToken":
                                var errorValidate = token.checkTokenBeforePayment();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'token';
                                    token.getCommission();
                                }
                                break;
                            case "paymentTokenInvoice":
                                var errorValidate = token.checkTokenBeforePayment();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'tokenInvoice';
                                    token.getCommissionInvoice();
                                }
                                break;
                            case "showVisaCheckoutForm":
                                $('#formCardVisaCheckout').addClass('hide');
                                $('#visacheckout-form').removeClass('hide');
                                break;
                            case "showVisaCheckoutFormInvoice":
                                $('#formCardVisaCheckoutInvoice').addClass('hide');
                                $('#visacheckout-form').removeClass('hide');
                                break;
                            case "showVisaCheckoutCardForm":
                                $('#formCardVisaCheckout').removeClass('hide');
                                $('#visacheckout-form').addClass('hide');
                                break;
                            case "showVisaCheckoutCardFormInvoice":
                                $('#formCardVisaCheckoutInvoice').removeClass('hide');
                                $('#visacheckout-form').addClass('hide');
                                break;
                            case "showVisaCheckoutCardFormStock":
                                $('#formCardVisaCheckoutStock').removeClass('hide');
                                $('#visacheckout-form').addClass('hide');
                                break;
                            case "showVisaCheckoutFormStock":
                                $('#formCardVisaCheckoutStock').addClass('hide');
                                $('#visacheckout-form').removeClass('hide');
                                break;
                            case "paymentVisaCheckout":
                                var errorValidate = vc.checkVcBefore();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'visacheckoutwithcvv';
                                    vc.getCommission();
                                }
                                break;
                            case "paymentVisaCheckoutInvoice":
                                var errorValidate = vc.checkVcBefore();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'visacheckoutwithcvvinvoice';
                                    vc.getCommissionInvoice();
                                }
                                break;
                            case "paymentVisaCheckoutVoucher":
                                var errorValidate = vc.checkVcBefore();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                if (util.submitAction === false) {
                                    self.actionPay = 'visacheckoutwithcvvvoucher';
                                    vc.getCommissionStock();
                                }
                                break;
                            case "okErrorVisaAccount":
                                $('#pg-error-visa-account__flow_request').addClass('hide');
                                $('#paymentBlock').removeClass('hide');
                                break;
                            case "goToPaymentFromStock":
                                var errorValidate = stock.checkDataStock();
                                stock.moveEmail();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                $('#voucherBlock').hide();
                                $('#sectionPaymentBlock').fadeIn();
                                break;
                            case "returnToEditVoucher":
                                $('#voucherBlock').fadeIn();
                                $('#sectionPaymentBlock').hide();
                                break;
                            case "returnToEditRequisites":
                                $('#payeeRequisitesBlock').fadeIn();
                                $('#sectionPaymentBlock').hide();
                                break;
                            case "goToPaymentFromRequisites":
                                var errorValidate = payeeparams.checkDataPayee();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                payeeparams.moveDataRequisites();
                                $('#payeeRequisitesBlock').hide();
                                $('#sectionPaymentBlock').fadeIn();
                                self.truncatePayeeMessage();
                                self.initForms();
                                break;
                            case "goToPaymentFromPayee":
                                var errorValidate = payeeparams.checkDataPayee();
                                if (errorValidate.status == 'error') {
                                    app.showErrors(errorValidate);
                                    return;
                                }
                                payeeparams.moveData();
                                $('#payeeParamsBlock').hide();
                                $('#sectionPaymentBlock').fadeIn();
                                self.initForms();
                                break;
                            case "returnToEditPayee":
                                $('#payeeParamsBlock').fadeIn();
                                $('#sectionPaymentBlock').hide();
                                break;
                            case "showInstallments":
                                $('#payeeParamsBlock').hide();
                                $('#sectionPaymentBlock').hide();
                                $('#paymentBlock').hide();
                                $('#installmentBlock').fadeIn();
                                break;
                            case "returnToPaymentFormFromInstallment":
                                $('#payeeParamsBlock').hide();
                                $('#installmentBlock').hide();
                                $('#sectionPaymentBlock').fadeIn();
                                $('#paymentBlock').fadeIn();
                                break;
                            case "showPrivatInstallment":
                                $('#listInstallment').hide();
                                $('#pg-privatinstallment-box-id').fadeIn();
                                break;
                            case "returnToInstallmentsFromPrivat":
                                $('#pg-privatinstallment-box-id').hide();
                                $('#listInstallment').fadeIn();
                                break;
                            case "privatInstallment":
                                self.actionPay = 'privatpartsintstallment';
                                installment.privatParts();
                                break;
                        }
                        return false;
                    });
                }
                return true;
            }
        };
        app.init();
    }
);
