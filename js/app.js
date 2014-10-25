$(function () {
  var app = {};

  app.Contact = Backbone.Model.extend({
    defaults: {
      lastName: '',
      firstName: '',
      email: '',
      phoneNumber: ''
    }
  });

  app.ContactList = Backbone.Collection.extend({
    model: app.Contact,
    localStorage: new Backbone.LocalStorage("contacts-storage"),

    search : function(keyword, attr){
      if(keyword == "") return this;
      var matcher = new RegExp(keyword,"i");
      return _(this.filter(function(data) {
        return matcher.test(data.get((attr)));
      }));
    }
  });

  app.contacts = new app.ContactList();

  app.ContactView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#item-template').html()),

    initialize: function(){
      this.model.on('change', this.render, this);
      this.model.on('destroy', this.remove, this);
    },  

    events: {
      'click #btn-edit' : 'editContact',
      'click #btn-save' : 'checkInputs',
      'click #btn-cancel' : 'removeUpdateForm',
      'click #btn-destroy': 'destroyContact'
    },

    render: function(){
      this.$el.html(this.template(this.model.toJSON()));
      this.input = this.$('.for-edit');
      return this;
    },

    editContact: function(){
      this.$el.addClass('editing');
    },

    checkInputs: function(){
      var newLN = this.$('#tb-lastName').val().trim();
      var newFN = this.$('#tb-firstName').val().trim();
      var newE = this.$('#tb-email').val().trim();
      var newPN = this.$('#tb-phoneNumber').val().trim();

      if(newLN && newFN && newE && newPN){
        this.updateContact(newLN, newFN, newE, newPN);
        this.removeUpdateForm();
      }else{
        alert("All fields are required.");
      }
    },

    destroyContact: function(){
      this.model.destroy();
    },

    removeUpdateForm: function(){
      this.$el.removeClass('editing');
    },

    updateContact: function(newLN, newFN, newE, newPN){
      this.model.save({
        lastName: newLN,
        firstName: newFN,
        email: newE,
        phoneNumber: newPN
      });
    }     
  });

  app.AppView = Backbone.View.extend({
    el: '#div-main',

    initialize: function () {
      app.contacts.on('add', this.addAll, this);
      app.contacts.on('reset', this.addAll, this);
      app.contacts.fetch();
    },

    events: {
      'click #btn-new': 'checkInputs',
      'click #btn-clear': 'clearInputs',
      'click #btn-search': 'searchContacts'
    },

    checkInputs: function(){
      var newLN = this.$('#tb-new-lastName').val().trim();
      var newFN = this.$('#tb-new-firstName').val().trim();
      var newE = this.$('#tb-new-email').val().trim();
      var newPN = this.$('#tb-new-phoneNumber').val().trim();

      if(newLN && newFN && newE && newPN){
        this.createContact(newLN, newFN, newE, newPN);
      }else{
        alert("All fields are required.");
      }
    },

    clearInputs: function(){
      this.$('#tb-new-lastName').val('');
      this.$('#tb-new-firstName').val('');
      this.$('#tb-new-email').val('');
      this.$('#tb-new-phoneNumber').val('');
    },

    createContact: function(newLN, newFN, newE, newPN){
      app.contacts.create({
        lastName: newLN,
        firstName: newFN,
        email: newE,
        phoneNumber: newPN
      });

      this.clearInputs();
    },

    clearList: function(){
      this.$('#contact-list').html('');
    },

    searchContacts: function(){
      var qKeyword = this.$('#tb-search').val().trim();
      var qType = $('input[name=search-category]:checked').val();
      var matches = app.contacts.search(qKeyword, qType);
      
      $("#table-title").html("Search result for '" + qKeyword + "' in " + this.formatType(qType));
      this.clearList();
      matches.each(this.addOne, this);
    },

    formatType: function(type){
      if (type == "lastName") return $("#lbl-lastName").html();
      if (type == "firstName") return $("#lbl-firstName").html();
      if (type == "email") return $("#lbl-email").html();
      if (type == "phoneNumber") return $("#lbl-phoneNumber").html();
      return "";
    },

    addAll: function(){
      $("#table-title").html("All Contacts");
      this.clearList();
      app.contacts.each(this.addOne, this);
    },

    addOne: function(contact){
      var newContact = new app.ContactView({model: contact});
      if(!this.qKeyword || (this.qKeyword && this.isMatch(newContact))){
        $('#contact-list').append(newContact.render().el);
      }
    }
  });

  app.appView = new app.AppView();
});

