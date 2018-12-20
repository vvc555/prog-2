$(document).ready(function(){
    $('.delete-post').on('click', function(p){
        $target = $(p.target);
        const id = $target.attr('data-id');
        $.ajax({
            type:'DELETE',
            url: '/delete/'+id,
            success: function(response){
                //alert('Kustutan projekti');
                window.location.href='/deleted';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
});


$(document).ready(function(){
    $('.check-post').on('click', function(p){
        $target = $(p.target);
        const id = $target.attr('data-id');
        $.ajax({
            type:'GET',
            url: '/check/'+id,
            success: function(response){
                alert('Muudan staatust');
                window.location.href='/checked';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
});