/*
*  All dscourse related code
*/

function Dscourse() {
    // Set global variables
    var top = this;
    // Main discussion data wrapper
    this.data = new Array();
    this.currentUserID = 0; 

    // Options for what to show and hide etc. 
    this.options = {
        charLimit : 500,
        synthesis : true,
        infoPanel : true,
        media : true,
        timeline : true
    }


    // Run initializing functions
    this.GetData();
    
}


Dscourse.prototype.GetData = function(discID) {
    /*
     *	Loads all the data needed for the discussion page
     */

    var main = this;

    // Ajax call to get data and put all data into json object
    $.ajax({ 
        type : "GET",
        url : "data.json",
        dataType : "json",
        success : function(data) {
            main.data = data;
            main.currentUserID = data.currentUser.userId; 
            main.SingleDiscussion();
            console.log(main.data); 
        },
        error : function(xhr, status) { // If there was an error
            console.log('There was an error getting data.');
            console.log(xhr);
            console.log(status);
        }
    });

}

Dscourse.prototype.SingleDiscussion = function() 
{
    /*
     *	Prints out the components of the discussion page. Has multiple dependancies on other functions in Dscourse object.
     */
    var main = this;

    $('#charCountTotal').html('/ ' + main.options.charLimit);
    // Add character limit information to commentwrap
    $('.levelWrapper[level="0"]').html('');
    // Empty the discussion div for refresh
    var o, userRole, dStatus;


    // What is the role of the current user for this discussion?
    userRole = main.data.currentUser.userRole;
    //console.log(userRole);

    // Draw up posts and timeline
    if (main.data.posts) {
        main.ListDiscussionPosts(userRole);
        // Main function for listing discussions -- very important!
        main.DrawTimeline();
    } else {
        $('.levelWrapper').append("<div id='nodisc' class='alert alert-info'> There are not posts in this discussion yet. Be the first one and add your voice by clicking on the <b>'Say'</b> button at the top (next to the discussion title)</div>");
    }

    // setInterval(function(){main.CheckNewPosts(discID, userRole, dStatus)},5000); // Checking for new posts... 
     
}

Dscourse.prototype.ListDiscussionPosts = function(userRole)// View for the Individual discussions.
{
    /*
     *	Lists posts for the discussion. This is the main function that builds the post view
     */
    var main = this;

    main.uParticipant = [];
    $('.singleDot').remove();
    // Clear all dots in the timeline
    main.timelineMin = 0;
    main.timelineMax = 0;
    // Clear timeline range
    $('#participantList').html('<button class="btn disabled">Participants: </button>');
    // Clear participant list
    var j, p, d, q, typeText, authorID, message, authorThumb, synthesisCount;
    
    var colors = 0;
    
    for ( j = 0; j < main.data.posts.length; j++) {// Go through all the posts
        d = main.data.posts[j];

        /********** TIMELINE ***********/
        var n = d.postTime;
        n = n.replace(/-/g, "/");
        // Correst the time input format
        var time = Date.parse(n);
        // Parse for browser.
        if (main.timelineMin == 0) {// Check and set minimum value for time
            main.timelineMin = n;
        } else if (time < ((typeof main.timelineMin =="string")?new Date(main.timelineMin).getTime():main.timelineMin)) {
            main.timelineMin = n;
        }
        if (main.timelineMax == 0) {// Check and set maximum value for time
            main.timelineMax = n;
        } else if (time > ((typeof main.timelineMax =="string")?new Date(main.timelineMax).getTime():main.timelineMax)) {
            main.timelineMax = n;
        }
        // END TIMELINE
        
        /********** DISCUSSION SECTION ***********/
        var authorID = main.getName(d.postAuthorId, 'first');
        // Get Authors name
        authorIDfull = main.getName(d.postAuthorId);
        authorThumb = main.getAuthorThumb(d.postAuthorId, 'small');
        // get thumbnail html
        authorThumb += '  ' + authorIDfull;
        switch(d.postType)// Get what kind of post this is
        {
            case 'agree':
                typeText = ' <span class="typicn thumbsUp "></span>';
                break;
            case 'disagree':
                typeText = ' <span class="typicn thumbsDown "></span>';
                break;
            case 'clarify':
                typeText = ' <span class="typicn unknown "></span>';
                break;
            case 'offTopic':
                typeText = ' <span class="typicn forward "></span>';
                break;
            case 'synthesis':
                typeText = ' <span class="typicn feed "></span>';
                break;
            default:
                typeText = ' <span class="typicn message "></span>';
        }
        if (d.postMessage != ' ') {// Proper presentation of the message URL
            message = d.postMessage;
            //message = main.showURL(message);
            message = message.replace("\n", "<br />");
        } else {
            continue;
            // Hide the post if there is no text in the message
            switch(d.postType)// Get what kind of post this is
            {
                case 'agree':
                    message = '<em class="timeLog">agrees.</em> ';
                    break;
                case 'disagree':
                    message = '<em class="timeLog">disagrees. </em>';
                    break;
                case 'clarify':
                    message = '<em class="timeLog">asked to clarify </em>';
                    break;
                case 'offTopic':
                    message = '<em class="timeLog">marked as off topic </em>';
                    break;
                default:
                    message = ' ';
            }
        }

        var topLevelMessage = ' ';
        // Assign a class for top level messages for better organization.
        if (d.postFromId == '0') {
            topLevelMessage = 'topLevelMessage';
        }

        // Check if this post has selection
        var selection = '';
        if(d.postSelection.length > 1){
        selection = ' <span href="#" rel="tooltip" title="This post has highlighted a segment in the parent post. Click to view." class="selectionMsg" style="display:none;">a</span> ';
        } 

        // Check if this post has media assigned.
        var media = '';
        if (d.postMedia.length > 1) {
            media = '<span href="#" rel="tooltip" title="This post has a ' + d.postMediaType + ' media attachment. Click to view." class="mediaMsg"> ' + d.postMediaType + '  <span class="typicn tab "></span> </span> ';
        }

        var showPost = 'yes';

        // // Is this post part of any synthesis?
        // var synthesis = '';
        // synthesis = main.PostInSynthesis(d.postID);

        if (showPost == 'yes') {

            var selector = 'div[level="' + d.postFromId + '"]';
            var responses = main.ResponseCounters(d.postID);

            $(selector).append(// Add post data to the view
            		'<div class="threadText ' + topLevelMessage + '" level="' + d.postID + '" postTypeID="' + d.postType + '" postAuthorId="' + d.postAuthorId + '" time="' + time + ' ">'
            		+  '<div class="postTypeView" slevel="' + d.postID + '"> ' + typeText + '</div>' 
            		+  '<div class="postTextWrap">'
            			 + '<span class="postAuthorView" rel="tooltip"  title="' + authorThumb + '"> ' + authorID + '</span>' 
            			 + '<span class="postMessageView"> ' + message + '</span>'
            			 + ((userRole == 'Instructor' || userRole == "TA")?'<i class="icon-trash deletePostButton" style="float:right; position:relative;top: 3px"></i>':'') 
            			 + '<i class="icon-edit editPostButton" style="float:right; position: relative;top:3px; right:5px"></i>'
            			 + media + selection + synthesis 
            		 + '</div>' 
            		 + ' <button class="btn btn-small btn-success sayBut2" style="display:none" postID="' + d.postID + '"><i class="icon-comment icon-white"></i> </button> '
            		  + '<div class="responseWrap" >' + responses + '</div>' 
            		+ '</div>'
            );

            /********** SYNTHESIS POSTS ***********/
            if (d.postType == 'synthesis') {
                if ((currentUserID == d.postAuthorId) || (userRoleAuthor == 'Instructor' || userRoleAuthor == 'TA')) {
                    var editPostButton = '<button class="btn btn-small editSynthesis" sPostID="' + d.postID + '">Edit</button> ';
                } else {
                    var editPostButton = '';
                }

                $('#synthesisList').prepend('<div class="synthesisPost " sPostID="' + d.postID + '">' + editPostButton + '<span class="postAuthorView" rel="tooltip" > ' + authorThumb + '</span>' + '		<p class="synthesisP">' + message + '</p>' + '		<div class="synthesisButtonWrap"> <span class="gotoSynthesis synButton" gotoID="' + d.postID + '"> Go to Post </span><span class="showPosts synButton">Show Posts</span></div>' + '	</div>');
                main.ListSynthesisPosts(d.postContext, d.postID, 'add');
                synthesisCount = 'some';
            }

            var pTime = main.GetUniformDate(d.postTime);
            //if this was posted since the user last viewed the discussion
            if(timeSince!="never" && pTime > timeSince){
                var t = new Date(0);
                t.setUTCMilliseconds(main.GetUniformDate(d.postTime));
                var prettyTime = jQuery.timeago(t);
                var shortMessage = main.truncateText(message, 60);
                var activityContent = '<li postid="' + d.postID + '">' + main.getAuthorThumb(d.postAuthorId, 'tiny') + ' ' + authorID + ' ' + typeText + ' <b>' + shortMessage + '</b> ' + '<em class="timeLog">' + prettyTime + '<em></li> ';
                $('#recentContent').prepend(activityContent);
            }
            else if(timeSince=="never" && $('#recentContent').children().length < 9){
                var t = new Date(0);
                t.setUTCMilliseconds(main.GetUniformDate(d.postTime));
                var prettyTime = jQuery.timeago(t);
                var shortMessage = main.truncateText(message, 60);
                var activityContent = '<li postid="' + d.postID + '">' + main.getAuthorThumb(d.postAuthorId, 'tiny') + ' ' + authorID + ' ' + typeText + ' <b>' + shortMessage + '</b> ' + '<em class="timeLog">' + prettyTime + '<em></li> ';
                $('#recentContent').prepend(activityContent);
            }
            /********** UNIQUE PARTICIPANTS SECTION ***********/
            var arrayState = jQuery.inArray(d.postAuthorId, main.uParticipant);
            // Chech if author is in array
            if (arrayState == -1) {// if the post author is not already in the array
                main.uParticipant.push(d.postAuthorId);
                // add id to the array
            }

        } // end if showpost.
    }// End looping through posts
    
    $('.deletePostButton').on('click', function(){
       var del = confirm("Are you sure you would like to delete this post? This option is irreversible."); 
       if(del){
            $.ajax({
                type: 'POST',
                url: 'php/data.php',
                data: {
                    action: 'delete',
                    context: 'post',
                    contextID: $(this).parent().parent().attr('level')
                },
                success: function(data){
                    //remove deleted post
                    main.data.posts = main.data.posts.filter(function(a){
                       return parseInt(a.postID) != data; 
                    });
                    //re-draw
                    var currentDisc = $('#dIDhidden').val();
                    main.SingleDiscussion(currentDisc);
                    main.DiscResize();
                    main.VerticalHeatmap();                 
                },
                error: function(xhr){
                    console.log(xhr);    
                }
            })    
       }
    });
    $('.deletePostButton').hide();
    $('.editPostButton').on('click', function(e){
        var parentPostID = $(this).parent().parent().attr('level');
        var parentPost = main.data.posts.filter(function(a){return a.postID == parentPostID})[0];
        /* can't put spans in a <textarea> 
        var colors = ['#FFFFB1', '#D8FFB1', '#B1FFB1', '#B1FFD8', '#B1FFFF', '#B1D8FF', '#B1B1FF', '#D8B1FF', '#FFB1FF', '#FFB1D8', '#FFB1B1', '#FFD8B1'];
        var highlights = $(this).closest('.threadText').find('.postTypeView').filter(function(){
            var a  = this;
            var those = main.data.posts.filter(function(b){
                return b.postID == $(a).attr('slevel')
            });
            return those[0].postSelection != '';
        }).map(function(){
            var a = this;
            return main.data.posts.filter(function(b){
               return b.postID==$(a).attr('slevel');
           }).map(function(a){
               var sel = a.postSelection.split(','); 
               return {start: sel[0], stop: sel[1]}
           }); 
        });
        $.each(highlights, function(i, val){
           parentPostMessage = parentPostMessage.substring(0,val.start)+
           '<span class="highlight" style="background-color:'+colors[i]+'">'
           +parentPostMessage.substring(val.start, val.stop)
           +'</span>'
           +parentPostMessage.substring(val.stop);
        });
        */
        var discID = $('#dIDhidden').val();
        var dStatus = main.DiscDateStatus(discID);
        var postID, participate, fromId; 
            if (dStatus != 'closed') {
                    participate = (settings.status=="OK")?true:false; 
                    // Check if participate value if anyone or network          
                    if(participate == true){
                        $('#highlightDirection').hide();
                        $('#highlightShow').hide();
                        var postQuote = $(this).parent().children('.postTextWrap').children('.postMessageView').html();
                        postQuote = $.trim(postQuote);
                        var xLoc = e.pageX - 80;
                        var yLoc = e.pageY + 10;
                        $('#commentWrap').css({
                            'top' : '20%',
                            'left' : '30%'
                        });
                        $('.threadText').removeClass('highlight');
                        
                        fromId = $(this).parent().parent().parent().attr('level'); 
                        postID =  "EDIT|||"+$(this).parent().parent().attr('level')+'|||'+fromId;
                        
                        if (postQuote != '') {
                            $('#highlightDirection').show();
                            $('#highlightShow').show().html(postQuote);
                        }
                        $('#postIDhidden').val(postID);
                        $('#overlay').show();
                        $('#commentWrap').fadeIn('fast');
                        $(this).parent('.threadText').removeClass('agree disagree comment offTopic clarify').addClass('highlight');
                        $('#text').val(parentPost.postMessage);
                        $.scrollTo($('#commentWrap'), 400, {
                            offset : -100
                        });
                        main.AddLog('discussion',discID,'SayButtonClicked',postID,' '); //postID is the parent post. 
                    }
            } else {
                alert('This discussion is closed.');
            }
    });        
    $('.editPostButton').hide();
    
    if($("#recentContent").children().length==0){
        $("#recentPostsHeader").html("Recent posts");
        $("#recentContent").append('<span>There are no new posts since you last visited</span>');
    }
    else if(!main.init){
        $("#recentPostsHeader").html("Recent posts");
    }
    else{
        //Build the recentPosts header
        if(lastView!='never')   
            $('#recentPostsHeader').html("Posts since you visited "+jQuery.timeago(new Date(main.GetUniformDate(lastView, false))));
        else{
            $('#recentPostsHeader').html("Posts since before you joined");
        }
    }
    if (synthesisCount == 'some') {
        $('#synthesisHelpText').hide();
    }

    main.timelineValue = main.timelineMax;
    // Set the timeline value to the max.
    $(".postTypeView").draggable({
        start : function() {
            //console.log('Drag started');

            main.sPostID = $(this).attr('slevel');
            // The id of the post
            main.sPostContent = $(this).parent().children('.postTextWrap').children('.postMessageView').html() // The content of the post
        },
        drag : function() {
            //console.log('Drag happening');
        },
        stop : function() {
            //console.log('Drag stopped!');
        },
        revert : 'invalid',
        containment : '#discussionWrap',
        helper : function(event) {
            var contents = $(this).siblings('.postTextWrap').html();
            return $('<div class="draggablePost">' + contents + ' </div>');
        },

        appendTo : '#discussionWrap'
    });
    $("#synthesisDrop").droppable({
        hoverClass : "sDropHover",
        tolerance : 'touch',
        drop : function(event, ui) {
        	main.AddLog('discussion',discID,'SynthesisDrop',main.sPostID,' '); 
            var shortText = main.truncateText(main.sPostContent, 100);
            var ids = [];
            $('#synthesisPostWrapper').children('.synthesisPosts').each(function() {
                ids.push($(this).attr('spostid'));
            });
            var instr = "Drag and drop posts here to add to synthesis.";
            var box = $(this);
            if (ids.indexOf(main.sPostID) == -1) {
                $('#synthesisPostWrapper').prepend('<div sPostID="' + main.sPostID + '" class=" synthesisPosts">' + shortText + ' <div>');
                // Append original post
                $(this).html("Added!");
            } else
                $(this).html('Already added!');
            window.setTimeout(function() {
                box.html(instr);
            }, 2000);
        }
    });
    main.DiscResize();
    main.VerticalHeatmap();
    if(typeof goTo != "undefined" && main.init){
        var p = $('.threadText[level='+goTo+']');
        p.click();
        $('#dMain').scrollTo(p, 400, {
            offset : -100
        });   
    }
}


Dscourse.prototype.getName = function(id, type) {
    /*
     *	Returns name of the user from ID
     */
    var main = this;
    if (type == 'first') {
        for (var n = 0; n < main.data.users.length; n++) {
            var userIDName = main.data.users[n].userId;
            if (userIDName == id)
                return main.data.users[n].firstName;
        }
    } else if (type == 'last') {
        for (var n = 0; n < main.data.users.length; n++) {
            var userIDName = main.data.users[n].userId;
            if (userIDName == id)
                return main.data.users[n].lastName;
        }
    } else {
        for (var n = 0; n < main.data.users.length; n++) {
            var userIDName = main.data.users[n].userId;
            if (userIDName == id)
                return main.data.users[n].firstName + " " + main.data.users[n].lastName;
        }
    }
}

Dscourse.prototype.getAuthorThumb = function(id, size) {
    /*
     *	Returns thumbnail html of the user from ID
     */
    var main = this;
    var l = main.data.users.length;
    for (var n = 0; n < l; n++) {
        if (main.colors.length==0){
            var hues = main.scatter(0,360, main.data.users.length);
            for(var i=0;i<main.data.users.length;i++){
                var fade = 0.25+(Math.random()*0.75);
                var color = d3.hsl(hues[i],1,fade);
                var font = d3.hsl(180+hues[i],1, Math.abs(fade-1));
                main.colors.push({color:color,font:font});     
            }
        }
    }
    for (var n = 0; n < main.data.users.length; n++) {
        var userIDName = main.data.users[n].userId;
        var color = main.colors[n].color;
        var font = main.colors[n].font;
        if (userIDName == id) {
        	var name = main.data.users[n].firstName + " " + main.data.users[n].lastName; 
            var initials = main.Initials(name); 
            if (size == 'small') {
                if(main.data.users[n].userPictureURL){
               		return "<img class='userThumbSmall' src='" + main.data.users[n].userPictureURL + "' />";	                
                } else {
	                return "<div class='userThumbSmall' style='color:"+font+";background:"+color+"'> "+initials+" </div>"; 
                }
            } else if (size == 'tiny') {
                if(main.data.users[n].userPictureURL){
	                return "<img class='userThumbTiny' src='" + main.data.users[n].userPictureURL + "' />";
	            } else {
		            return "<div class='userThumbTiny' style=' color:"+font+";background:"+color+"'> "+initials+" </div>"; 
	            }
            }
        }
    }
}
Dscourse.prototype.PostInSynthesis = function(postID) {
    /*
     *	Checks to see if this posts is in a synthesis so a notification can be drawn next to the post.
     */

    var main = this;
    var output = '';
    var count = 0;
    var j, k, i, o;
    for ( j = 0; j < main.data.posts.length; j++) {// Go through all the posts in this discussion
        k = main.data.posts[j];
        if (k.postContext) {// Check post context where synthesis information is
            var posts = k.postContext.split(",");
            // Split post content into array
            for ( i = 0; i < posts.length; i++) {// For each posts in the array
                o = posts[i];
                if (o == postID) {// check if this post is synthesis in the source post
                    output += '<span rel="tooltip" title="' + main.getName(k.postAuthorId, 'first') + '  made a connection to this post. Click to view." class="SynthesisComponent hide" synthesisSource="' + k.postID + '"><span class="typicn feed "></span></span>';
                    count++;
                }
            }
        }
    }
    if (count > 1) {// After collecting all the posts combine them into html output
        $(output).off('click');
        output = '<span class="synthesisWrap"> <b>' + count + '</b> Connections ' + output + '</span>';
    } else if (count == 1) {
        $(output).on('click', function(e) {
            var thisPost = $(this).attr('synthesissource');
            var postRef = '.synthesisPost[sPostID="' + thisPost + '"]';
            $('#dSidebar').scrollTo($(postRef), 400, {
                offset : -100
            });
            $(postRef).addClass('animated flash').css('background-color', 'rgba(255,255,176,1)').delay(5000).queue(function() {
                $(this).removeClass('highlight animated flash').css('background-color', 'whitesmoke');
                $(this).dequeue();
            });
            $('#dInfo').fadeOut();
            // hide #dInfo
            $('#dSynthesis').fadeIn();
            // show #synthesis
        });
    }
    return output;
}

Dscourse.prototype.GetUniformDate = function(date, off){
    if(typeof off == "undefined")
        off = true;
    var d = false;
    if(typeof date == "object"){
        d = date.getTime();
    }
    else if(typeof date == "number"){
        d = new Date(date).getTime();
    }
    else if(typeof date == "string"){
        date = date.replace(/-/g, '/');
        var chrome = /chrome/.test(navigator.userAgent.toLowerCase());
        if(($.browser.safari || $.browser.msie) && !chrome)
           d = new Date(date.split('-').join('/')).getTime();
        else if($.browser.webkit || $.browser.mozilla)
            d = new Date(date).getTime();
        else
            d = new Date(date.split(' ').join('T')).getTime();   
    }
    if(off){
        //convert to user's timezone
        var diff = new Date().getTimezoneOffset();
        d-=diff*60000;
    }
    return d;
}

Dscourse.prototype.truncateText = function(text, length) {

    if (text.length < length) {
        return text;
    } else {

        var myString = text;
        var myTruncatedString = myString.substring(0, length) + '... ';
        return myTruncatedString;

    }

}
