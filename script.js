$(function(){
    $(document).on('click','.fa-minus',function(){    $(this).closest('.chatbox').toggleClass('chatbox-min');
    });
    $(document).on('click','.fa-times',function(){
        $(this).closest('.chatbox').hide();
    });
});