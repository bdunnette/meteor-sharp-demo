var createThumb = function(fileObj, readStream, writeStream) {
  var thumbnailPipeline = sharp()
    .resize(256, 256)
    .max()
    .jpeg()
    .on('error', function(err) {
      console.log(err);
    });

  readStream.pipe(thumbnailPipeline).pipe(writeStream);
};

var createPng = function(fileObj, readStream, writeStream) {
  var thumbnailPipeline = sharp()
    .withMetadata()
    .png()
    .gamma()
    .normalize()
    .on('error', function(err) {
      console.log(err);
    });

  readStream.pipe(thumbnailPipeline).pipe(writeStream);
};

Images = new FS.Collection("images", {
  stores: [
    new FS.Store.GridFS("thumbs", {
      beforeWrite: function(fileObj) {
        return {
          extension: 'jpeg',
          type: 'image/jpeg'
        };
      },
      transformWrite: createThumb
    }),
    new FS.Store.GridFS("web", {
      beforeWrite: function(fileObj) {
        return {
          extension: 'png',
          type: 'image/png'
        };
      },
      transformWrite: createPng
    }),
    new FS.Store.GridFS("images")
  ],
  filter: {
    allow: {
      contentTypes: ['image/*'] //allow only images in this FS.Collection
    }
  }
});

if (Meteor.isClient) {
  Template.fileList.helpers({
    images: function() {
      return Images.find();
    }
  });

  Template.fileUpload.events({
    'change .myFileInput': function(event, template) {
      FS.Utility.eachFile(event, function(file) {
        Images.insert(file, function(err, fileObj) {
          // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
        });
      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    // code to run on server at startup
  });
}
