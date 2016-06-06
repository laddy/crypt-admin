$(function(){
   $('.hidden-pass').mouseover(function(){
       $(this).html($(this).data('pass'));
   }).mouseout(function(){
       $(this).html('*****');
   });
});