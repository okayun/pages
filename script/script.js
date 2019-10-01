// タブ切り替え
$(function() {
  $('.tab').click(function() {
    $('.tab').removeClass('active-tab');
    $('.content').removeClass('active-content');

    var idx = $('.tab').index(this);

    $('.tab').eq(idx).addClass('active-tab');
    $('.content').eq(idx).addClass('active-content');
  });
});