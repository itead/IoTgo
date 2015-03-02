var path = require('path');
var origin = require('git-origin-url');
var gitTag = require('git-tag')({localOnly: true});
var isGitRepo = require('is-git-repo');

exports.isRepo = function (callback) {
  isGitRepo(path.join(__dirname, "../"), function (flag) {
    callback(flag);
  });
};

exports.getRepoName = function (callback) {
  origin(function (err, url) {
    if (err) return callback(err);
    callback(null, path.basename(url, '.git'));
  });
};

exports.getCurrentVersion = function (callback) {
  gitTag.latest(function (res) {
    callback(res);
  });
};