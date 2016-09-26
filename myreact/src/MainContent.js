import React, { Component } from 'react';

class MainContent extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <section className="container" ng-controller="MainCtrl">
                <div className="row">
                    <form className="form-inline dash-border" role="form">
                        <label for="selProductBrand">Brand</label>
                        <select className="form-control" name="selProductBrand" id="selProductBrand" ng-model="form.selProductBrand"
                                ng-change="selProductBrandChanged()"
                                ng-options="option.brand as option.brand for option in optProductBrand | orderBy:'brand'"></select>

                        <label for="selProductModel">Model</label>
                        <select className="form-control" name="selProductModel" id="selProductModel" ng-model="form.selProductModel"
                                ng-change="selProductModelChanged()" ng-disabled="! form.selProductBrand"
                                ng-options="option.model as option.model for option in optProductModel | orderBy:'model'"></select>

                        <label for="selProductSPEC">SPEC</label>
                        <select className="form-control" name="selProductSPEC" id="selProductSPEC" ng-model="form.selProductSPEC"
                                ng-change="selProductSPECChanged()" ng-disabled="! form.selProductModel"
                                ng-options="option.spec as option.spec for option in optProductSPEC | orderBy:'spec'"></select>

                        <label for="selCurrency">Currency</label>
                        <select className="form-control" name="selCurrency" id="selCurrency" ng-model="form.selCurrency"
                                ng-change="selCurrencyChanged()"
                                ng-options="option.currency as option.currency for option in optCurrency | orderBy:'currency'"></select>

                        <label for="comDate">Exchange Date</label>

                        <div className="input-group" id="comDate" name="comDate">
                            <input type="text" className="form-control" name="inpEXDate" id="inpEXDate"
                                   uib-datepicker-popup="yyyy-MM-dd"
                                   ng-model="form.inpEXDate" is-open="inpEXDatePopup.opened" datepicker-options="inpEXDateOpt"
                                   ng-required="true" close-text="Close" ng-change="condsCheck()"/>
                            <span className="input-group-btn">
                  <button type="button" className="btn btn-info" ng-click="inpEXDateClick()">
                  <i className="glyphicon glyphicon-calendar"></i>
                  </button>
                  </span>
                        </div>

                        <label for="btnPriceQuery"></label>
                        <button className="btn btn-success form-control" name="btnPriceQuery" id="btnPriceQuery"
                                ng-show="condsCompleted" ng-click="priceEnquiry()">
                            Search
                        </button>
                    </form>
                </div>
                <div className="row" ng-show="GridData">
                    <uib-tabset active="activeJustified" justified="true" type="pills">
                        <uib-tab ng-repeat="tab in tabs" heading="{{tab.title}}" active="tab.active" disable="tab.disabled">
                            <div ng-include="tab.template"></div>
                        </uib-tab>
                    </uib-tabset>
                </div>
                <div className="row">
                    <p className="col-lg-12 margin-less padding-5px dash-border">
                        For the history of price updated, please go here: <a className="btn btn-info btn-sm" title="MOBILE PRICE HISTORY" href="history.html" target="_self">History</a>
                    </p>
                </div>
            </section>
        );
    }
}

export default MainContent; // Don't forget to use export default!
