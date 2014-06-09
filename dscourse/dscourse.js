/*
*  All dscourse related code
*/

function Dscourse(apiLink) {
    // Set global variables
    var top = this;
    // Main discussion data wrapper
    this.data = [];

    this.colors = [];
    this.currentUserID = 0;
    this.currentUserRole = 'student';
    this.currentDrawing = '';
    this.postMediaType = 'draw';
    this.currentReplyPost = 0;
    this.uParticipant = [];
    // Options for what to show and hide etc.
    this.options = {
        charLimit : 500,
        synthesis : false,
        infoPanel : true,
        media : true,
        timeline : true
    };
    this.api = apiLink;


    // Run initializing functions
    this.loadDscourse();  // Load the html

   /************************ DISCUSSION EVENTS  ************************/
    /* Make the commenting box draggable */
    $('#commentWrap').draggable({
        handle : '.commentWrapHandle'
    });

    /* Add highlighted text to the comment */
    $(document).on('mouseup', '#highlightShow', function() {
        var spannedText = $(this).find('span').text();
        //remove highlight from text
        $(this).find('span').replaceWith(spannedText);
        top.currentSelected = top.GetSelectedText();
        var element = document.getElementById("highlightShow");
        var range = top.GetSelectedLocation(element);
        top.currentStart = range.start;
        top.currentEnd = range.end;
        $('#locationIDhidden').val(top.currentStart + ',' + top.currentEnd);
        // Add location value to form value;
        var hShow = $('#highlightShow');
        var replaceText = hShow.html();
        var newSelected = '<span class="highlight">' + top.currentSelected + '</span>';
        var n = replaceText.substring(0,range.start)+newSelected+replaceText.substring(range.end);
        hShow.html(n);
    });

    /* Tooltips */
    $('#discussionDivs').tooltip({
        selector : "span",
        placement : 'bottom',
        html : true
    });
    $('#participants').tooltip({
        selector : "button",
        html : true
    });
    $('#shivaDrawPaletteDiv').tooltip({
        selector : "button"
    });


    /* When mouse hovers over the post */
    $(document).on('mouseover', '.threadText', function(event) {
        event.stopImmediatePropagation();
        var postClickId = $(this).closest('div').attr('level');
        top.HighlightRelevant(postClickId);
        $(this).children('.sayBut2').css('display', 'inline');
        if (!$(this).hasClass('lightHighlight')) {
            $(this).addClass('lightHighlight');
        }

        var aID = $(this).attr('postauthorid');
        var pID = $(this).attr('level');
        //var time = top.GetUniformDate(top.data.posts.filter(function(a){return a.postID == pID})[0].postTime) > new Date().getTime() - (15000+1000*240);
        //if((aID == top.currentUserID && time)|| top.currentUserRole=="Instructor"|| top.currentUserRole=="TA");
    });

    /* When mouse hovers out of the post */
    $(document).on('mouseout', '.threadText', function(event) {
        event.stopImmediatePropagation();
        $(this).children('.sayBut2').hide();
        $(this).removeClass('lightHighlight');
    });

    /* When there are new posts and a refresh is required */
    $(document).on('click', '.refreshBox', function() {
        $(this).hide();
        var discID = $(this).attr('discID');
        top.GetData();
        // We load our new discussion with all the posts up to date
    });



    /* Keyword search functionality within the discussion page */
    $(document).on('keyup', '#keywordSearchText', function() {
        var searchText = $('#keywordSearchText').val();
        // get contents of the box
        if (searchText.length > 0 && searchText != ' ') {
            top.ClearVerticalHeatmap();
            top.VerticalHeatmap('keyword', searchText);
            // Send text to the vertical heatmap app
        } else {
            top.ClearKeywordSearch('#dMain');
            top.ClearVerticalHeatmap();
            top.VerticalHeatmap();

        }
    });

    $(document).on('click', '.resetSearch', function() {
        var searchText = $('#keywordSearchText').val('');
            top.ClearKeywordSearch('#dMain');
            top.ClearVerticalHeatmap();
            top.VerticalHeatmap();

    });


    /* Adding a new post to the discussion */
    $(document).on('click', '#addPost', function() {
        if (!top.charCount) {
            alert('You can\'t post because you went above the character limit');
        } else {
            var checkDefault = $('#text').val();
            // Check to see if the user is adding default comment text.
            var buttonType = $('#postTypeID > .active').attr('id');
            // If comment button has class active
            if (buttonType == 'comment') {
                if (checkDefault == 'Your comment...' || checkDefault == '') {
                    $('#text').addClass('textErrorStyle');
                    $('#textError').show();
                } else {
                    postOK();
                }
            } else {
                postOK();
            }
        }

        // if checks out then do it.
        function postOK() {
            $('.threadText').removeClass('highlight');
            if (checkDefault == 'Why do you agree?' || checkDefault == 'Why do you disagree?' || checkDefault == 'What is unclear?' || checkDefault == 'Why is it off topic?') {
                $('#text').val(' ');
            }
            top.AddPost();
            // Function to add post
            $('#commentWrap').slideUp();
            $('#overlay').hide();
            $('#shivaDrawDiv').hide();
            $('#shivaDrawPaletteDiv').hide();
            top.ClearPostForm();
            $('.threadText').removeClass('yellow');
            top.VerticalHeatmap();
        }

    });

    /* When the comment box is clicked change the placeholder text */
    $(document).on('click', '#text', function() {
        var value = $('#text').val();
        if (value == 'Why do you agree?' || value == 'Why do you disagree?' || value == 'What is unclear?' || value == 'Why is it off topic?' || value == 'Your comment...') {
            $('#text').val('');
        }
    });

    $(document).on('keyup', '#text', function() {
        var value = $('#text').val();
        var charLength = value.length;
        $('#charCount').html(charLength);
        if (charLength > top.options.charLimit) {
            $('#charCount').css('color', 'red');
            top.charCount = false;
        } else {
            $('#charCount').css('color', 'black');
            top.charCount = true;
        }
    });

    /* When say button is clicked comment box appears and related adjustments take place */
    $(document).on('click', '.sayBut2', function() {
        var postQuote;
        var postID;
         console.log('werwrwerewr');
        $('#highlightDirection').hide();
        $('#highlightShow').hide();
        postQuote = $(this).parents('div').parent('div').parent('div').children('.postTextWrap').children('.postMessageView').html();
        console.log(postQuote);
        postQuote = $.trim(postQuote);
        $('#commentWrap').css({
            'top' : '20%',
            'left' : '30%'
        });
        $('.threadText').removeClass('highlight');
        postID = $(this).attr("postID");
        console.log(postID);
        if (postQuote != '') {
            $('#highlightDirection').show();
            $('#highlightShow').show().html(postQuote);
        }
        top.currentReplyPost = postID;

        $('#commentWrap').fadeIn('fast');
        $(this).parent('.threadText').removeClass('agree disagree comment offTopic clarify').addClass('highlight');
        $('#text').val('Your comment...');
        $.scrollTo($('#commentWrap'), 400, {
            offset : -100
        });

    });

    /* When users cancels new post addition  */
    $(document).on('click', '#postCancel', function() {
        $('.threadText').removeClass('highlight');
        $('#commentWrap').fadeOut();
        $('#overlay').hide();
        $('#shivaDrawDiv').hide();
        $('#shivaDrawPaletteDiv').hide();
        top.ClearPostForm();
    });


    /* When user changes the option type for commenting */
    $(document).on('click', '.postTypeOptions', function() {
        $('.postTypeOptions').removeClass('active');
        $(this).addClass('active');
        var thisID = $(this).attr('id');
        var txt = $('#text').val();
        if (txt == 'Why do you agree?' || txt == 'Why do you agree?' || txt == 'Why do you disagree?' || txt == 'What is unclear?' || txt == 'Why is it off topic?' || txt == 'Your comment...') {// Check is the text is still the default text; we don't want to override what they wrote.
            switch(thisID)// Get what kind of post this is
            {
                case 'agree':
                    $('#text').val('Why do you agree?');
                    break;
                case 'disagree':
                    $('#text').val('Why do you disagree?');
                    break;
                case 'clarify':
                    $('#text').val('What is unclear?');
                    break;
                case 'offTopic':
                    $('#text').val('Why is it off topic?');
                    break;
                default:
                    $('#text').val('Your comment...');
            }
        }
    });

    /* When media button is clicked to show media options */
    $(document).on('click', '#media', function() {
        $('#commentWrap').hide();
        $('#mediaBox').show();
        var mHeight = $(window).height() - 300 + 'px';
        $('#mediaWrap').html('<iframe id="node" src="http://www.viseyes.org/shiva/draw.htm" width="100%" height="' + mHeight + '" frameborder="0" marginwidth="0" marginheight="0">Your browser does not support iframes. </iframe>');
        $('html, body').animate({
            scrollTop : 0
        });
    });

    /* Events to close the media section */
    $(document).on('click', '#closeMedia', function() {
        $('#mediaBox').hide();
        $('#displayFrame').hide();
        $('#commentWrap').show();
    });

    $(document).on('click', '#closeMediaDisplay', function() {
        if(top.activeFilter=="keyword"){
            if($("#keywordSearchText").val()!="")
                $("#keywordSearchText").blur();
        }
        else
             $('.uList').filter(function(){return $(this).attr('active')=="true";}).click(); 
      
        $('#commentWrap').hide();
        $('#displayFrame').hide();
    });

    /* User heatmap buttons */
    $(document).on('click', '.uList', function() {
        $('.uList').attr('active', false);
        $(this).attr('active', true);
        var uListID = $(this).attr('authorId');
        top.ClearVerticalHeatmap();
        top.VerticalHeatmap('user', uListID);
    });

    /* The types of comments */
    $(document).on('click', '.drawTypes', function() {// This needs to be readded - TODO
        top.postMediaType = 'draw';
        var mHeight = $(window).height() - 300 + 'px';
        $('.drawTypes').removeClass('active');
        var drawType = $(this).attr('id');
        // New iframe way
        switch(drawType)// Get what kind of iframe this is
        {
            case 'Video':
                type = 'video';
                break;
            case 'Drawing':
                type = 'draw';
                break;
            case 'Map':
                type = 'map';
                break;
            case 'Web':
                type = 'webpage';
                break;
            default:
                type = 'draw';
        }
        var html = '<iframe id="node" src="http://www.viseyes.org/shiva/' + type + '.htm" width="100%" height="' + mHeight + '" frameborder="0" marginwidth="0" marginheight="0">Your browser does not support iframes. </iframe>';
        $('#mediaWrap').html(html);
        top.postMediaType = type;
        $(this).addClass('active');
    });

    /* Continue to adding post when the drawing is done. Saves drawing data into the post */
    $(document).on('click', '#continuePost', function() {
        top.currentDrawing = '';
        ShivaMessage('node', 'GetJSON');
        //console.log(top.currentDrawing);
        $('#mediaBox').hide();
        $('#commentWrap').show();
    });

    /* Cancel drawing */
    $(document).on('click', '#drawCancel', function() {
        top.currentDrawing = '';
        $('#mediaBox').hide();
        $('#commentWrap').show();
    });

    /* Adding the shiva framework for chosen media type. This is important for media drawing */
    $(document).on('click', '.mediaMsg', function(event) {
        event.stopImmediatePropagation();
        var postId = $(this).closest('.threadText').attr('level');
        top.currentDrawData = '';
        top.currentMediaType = 'Draw';
        var cmd;
        $('#displayDraw').html('').append('<iframe id="displayIframe" src="http://www.viseyes.org/shiva/go.htm" width="100%" frameborder="0" marginwidth="0" marginheight="0">Your browser does not support iframes. </iframe>');
        var i, o;
        for ( i = 0; i < top.data.posts.length; i++) {
            o = top.data.posts[i];
            if (o.postID == postId) {
                //console.log(o.postMedia);
                cmd = "PutJSON=" + o.postMedia;
                $('#displayFrame').show();
                $('html, body').animate({
                    scrollTop : 0
                });
            }
        }
        $('#displayIframe').load(function() {
            document.getElementById('displayIframe').contentWindow.postMessage(cmd, "*");
        }).queue(function() {
            top.VerticalHeatmap();
            $('#containerDiv').css('width', '100% !important');
            $(this).dequeue();
        });
    });
    /* When items in the recent contents section are clicked */
    $(document).on('click', '#recentContent li', function() {
        var postID = $(this).attr('postid');
        var postRef = 'div[level="' + postID + '"]';
        $(document).scrollTo($(postRef), 400, {
            offset : -100
        });
        $(postRef).removeClass('agree disagree comment offTopic clarify').addClass('animated flash').css('background-color', 'rgba(255,255,176,1)').delay(5000).queue(function() {
            $(this).removeClass('highlight animated flash').css('background-color', '#fff');
            $(this).dequeue();
        });
    });
    /*  Vertical Heatmap scrolling */
    $(document).on('click', '.vHeatmapPoint', function() {
        var postID = $(this).attr('divpostid');
        var postRef = 'div[level="' + postID + '"]';
        $(document).scrollTo($(postRef), 400, {
            offset : -100
        });
        $(postRef).removeClass('agree disagree comment offTopic clarify').addClass('animated flash').css('background-color', 'rgba(255,255,176,1)').delay(5000).queue(function() {
            $(this).removeClass('highlight animated flash').css('background-color', '#fff');
            $(this).dequeue();
        });
        $('.vHeatmapPoint').removeClass('highlight');
        $(this).addClass('highlight');
    });

    $(window).resize(function() {// When window size changes resize
        top.DiscResize();
        top.VerticalHeatmap();
    });
    $(window).scroll(function() {// When window size changes resize
        top.DiscResize();
        top.VerticalHeatmap();
    });
};

Dscourse.prototype.loadDscourse = function() {
    /*
     *	Load the html and get the data when that works.
     */
    var main = this;
    $( "#dscourse" ).load( "dscourse/dscourse.html", function() {
        main.GetData();
        // When the main window scrolls heatmap needs to redraw
        $('#dMain').on('scroll', function() {
            console.log('move');
            //main.VerticalHeatmap();
            //main.DrawShape();
        });
    });


};

Dscourse.prototype.GetData = function() {
    /*
     *	Loads all the data needed for the discussion page
     */

    var main = this;

    // Ajax call to get data and put all data into json object
    $.ajax({ 
        type : "POST",
        url : main.api,
        data : {
            action : "GetData",
            postPage : 1 // This needs to be received from the page.

        },
        success : function(data) {
            console.log(data);
            main.data = data;
            main.currentUserID = data.currentUser.userId; 
            main.SingleDiscussion();
            main.currentUserID = data.currentUser.userId;
            main.currentUserRole = data.currentUser.userRole;
            main.DiscResize();
        },
        error : function(xhr, status) { // If there was an error
            console.log('There was an error getting data.');
            console.log(xhr);
            console.log(status);
        }
    });

};

Dscourse.prototype.DeletePost = function(postId) {
    /*
     *	Deletes posts from the server
     */

    var main = this;
    $.ajax({
        type: 'POST',
        url: main.api,
        data: {
            action: 'DeletePost',
            postId: postId
        },
        success: function(data){
            console.log(data);
            main.GetData();
            main.RebuildPosts();
        },
        error: function(xhr){
            console.log(xhr);
        }
    });
};

Dscourse.prototype.RebuildPosts = function() {
    /*
     *	Rebuild discussion page as changes happen
     */
    var main = this;

    $('.levelWrapper[level="0"]').html('');
    main.SingleDiscussion();
    main.VerticalHeatmap();

};

Dscourse.prototype.SingleDiscussion = function() {
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
};

Dscourse.prototype.ListDiscussionPosts = function(userRole) {
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
        console.log(authorID);
        // Get Authors name
        authorIDfull = main.getName(d.postAuthorId);
        authorThumb = main.getAuthorThumb(d.postAuthorId, 'small');
        // get thumbnail html
        authorThumb += '  ' + authorIDfull;
        switch(d.postType)// Get what kind of post this is
        {
            case 'agree':
                typeText = ' <span class="glyphicon glyphicon-thumbs-up"></span>';
                break;
            case 'disagree':
                typeText = ' <span class="glyphicon glyphicon-thumbs-down "></span>';
                break;
            case 'clarify':
                typeText = ' <span class="glyphicon glyphicon-question-sign "></span>';
                break;
            case 'offTopic':
                typeText = ' <span class="glyphicon glyphicon-share "></span>';
                break;
            case 'synthesis':
                typeText = ' <span class="typicn feed "></span>';
                break;
            default:
                typeText = ' <span class="glyphicon glyphicon-comment"></span>';
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
        if(d.postSelection){
        selection = ' <span href="#" rel="tooltip" title="This post has highlighted a segment in the parent post. Click to view." class="selectionMsg" style="display:none;">a</span> ';
        } 

        // Check if this post has media assigned.
        var media = '';
        if (d.postMedia) {
            media = '<span href="#" rel="tooltip" title="This post has a ' + d.postMediaType + ' media attachment. Click to view." class="mediaMsg"> ' + d.postMediaType + '  <span class="typicn tab "></span> </span> ';
        }
        console.log(d.postMedia);

        var showPost = 'yes';



        if (showPost == 'yes') {

            var selector = 'div[level="' + d.postFromId + '"]';
            var responses = main.ResponseCounters(d.postID);

            $(selector).append(// Add post data to the view
            		'<div class="threadText ' + topLevelMessage + '" level="' + d.postID + '" postTypeID="' + d.postType + '" postAuthorId="' + d.postAuthorId + '" time="' + time + ' ">'
            		+  '<div class="postTypeView" slevel="' + d.postID + '"> ' + typeText + '</div>' 
            		+ '<div class="postTopRow"><span class="postAuthorView" rel="tooltip"  title="' + authorThumb + '"> ' + authorID + '</span><div class="postMeta"> <span class="postMetaBtn replyPost sayBut2" postID="' + d.postID + '"> <span class="glyphicon glyphicon-plus"></span>  Reply </span><div class="postMetaBtn responseWrap" >' + responses + '</div> <div class="postMetaBtn" > ' + ((userRole == 'Instructor' || userRole == "TA")?'<i class="glyphicon glyphicon-trash deletePostButton" ></i>':'') + ' <i class="glyphicon glyphicon-edit editPostButton"></i> </div>' + '   </div></div>'
                        +  '<div class="postTextWrap">'
            			      + '<span class="postMessageView"> ' + message + '</span>'
            			 + media + selection
            		 + '</div>' 
            		 //+ ' <button class="btn btn-sm btn-success sayBut2" style="display:none" postID="' + d.postID + '"> <span class="typicn plus "></span>  </button> '

            		+ '</div>'
            );



            var t = new Date(0);
            t.setUTCMilliseconds(main.GetUniformDate(d.postTime));
            var prettyTime = jQuery.timeago(t);
            var shortMessage = main.truncateText(message, 60);
            var activityContent = '<li postid="' + d.postID + '">' + main.getAuthorThumb(d.postAuthorId, 'tiny') + ' ' + authorID + ' ' + typeText + ' <b>' + shortMessage + '</b> ' + '<em class="timeLog">' + prettyTime + '<em></li> ';
            $('#recentContent').prepend(activityContent);
            
            /********** UNIQUE PARTICIPANTS SECTION ***********/
            var arrayState = jQuery.inArray(d.postAuthorId, main.uParticipant);
            // Chech if author is in array
            if (arrayState == -1) {// if the post author is not already in the array
                main.uParticipant.push(d.postAuthorId);
                // add id to the array
            }
            console.log(main.uParticipant);

        } ;// end if showpost.
    };// End looping through posts
    
    $('.deletePostButton').on('click', function(){
       var del = confirm("Are you sure you would like to delete this post? This option is irreversible.");
       var postID =  $(this).closest('.threadText').attr('level');
       console.log(postID);
        if(del){
           main.DeletePost(postID);
       }
    });


    $('.editPostButton').on('click', function(e){
        var parentPostID = $(this).closest('.threadText').attr('level');
        console.log(parentPostID);
        var parentPost = main.data.posts.filter(function(a){return a.postID == parentPostID})[0];
        var postID, fromId;

        $('#highlightDirection').hide();
        $('#highlightShow').hide();
        var postQuote = $(this).parent().children('.postTextWrap').children('.postMessageView').html();
        postQuote = $.trim(postQuote);
        $('#commentWrap').css({
            'top' : '20%',
            'left' : '30%'
        });
        $('.threadText').removeClass('highlight');

        fromId = $(this).closest('.threadText').parent().attr('level');
        postID =  "EDIT|||"+$(this).closest('.threadText').attr('level')+'|||'+fromId;

        if (postQuote != '') {
            $('#highlightDirection').show();
            $('#highlightShow').show().html(postQuote);
        }

        // Change Add
        main.currentReplyPost = postID ;
        $('#overlay').show();
        $('#commentWrap').fadeIn('fast');
        $(this).parent('.threadText').removeClass('agree disagree comment offTopic clarify').addClass('highlight');
        $('#text').val(parentPost.postMessage);
        $.scrollTo($('#commentWrap'), 400, {
            offset : -100
        });


    });        


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

    main.DiscResize();
    main.VerticalHeatmap();
    if(typeof goTo != "undefined" && main.init){
        var p = $('.threadText[level='+goTo+']');
        p.click();
        $(document).scrollTo(p, 400, {
            offset : -100
        });   
    }
    main.UniqueParticipants();

}

Dscourse.prototype.getName = function(id, type) {
    /*
     *	Returns name of the user from ID
     */
    var main = this;
    for (var n = 0; n < main.data.users.length; n++) {
        if (main.data.users[n].userId == id){
            if (type == 'first') {
                return main.data.users[n].firstName;
            } else if (type == 'last') {
                return main.data.users[n].lastName;
            } else {
                return main.data.users[n].firstName + " " + main.data.users[n].lastName;
            }
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
};


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
        if(($.browser.safari() || $.browser.msie()) && !chrome)
           d = new Date(date.split('-').join('/')).getTime();
        else if($.browser.mozilla())
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
};

Dscourse.prototype.truncateText = function(text, length) {
    if (text.length < length) {
        return text;
    } else {
        return text.substring(0, length) + '... ';
    }
};

Dscourse.prototype.scatter = function (start, stop, qty){
    //cover base case
    var res = [stop/2];
    var n = 2;
    while(res.length<qty){
        var step = stop/(Math.pow(2,n));
        var back = n-1;
        var uni = [];
        for(var i=0; i<back; i++){
            var pos = res[(res.length-1)-i];
            uni.push(pos-step);
            uni.push(pos+step);
            if(res.length == qty)
                break;
        }
        res= res.concat(uni);
        n++;
    }
    return res;
};

Dscourse.prototype.ResponseCounters = function(postId) {
    /*
     *  Generates the html printout about how many responses each post has.
     */
    var main = this;
    var comment = 0;
    var commentPeople = '';
    var agree = 0;
    var agreePeople = '';
    var disagree = 0;
    var disagreePeople = '';
    var clarify = 0;
    var clarifyPeople = '';
    var offTopic = 0;
    var offTopicPeople = '';
    var i, o, commentText, text;
    for ( i = 0; i < main.data.posts.length; i++) {
        o = main.data.posts[i];
        if (o.postFromId == postId) {

            var postAuthor = main.getName(o.postAuthorId);

            switch(o.postType)// Get what kind of post this is
            {
                case 'agree':
                    var d1 = agreePeople.indexOf(postAuthor);
                    // Do not add if author already exists
                    if (d1 == -1) {
                        if (agreePeople.length > 0) {
                            agreePeople += '<br />';
                        }
                        agreePeople += postAuthor;
                    }
                    agree++;
                    break;
                case 'disagree':
                    var d2 = disagreePeople.indexOf(postAuthor);
                    // Do not add if author already exists
                    if (d2 == -1) {
                        if (disagreePeople.length > 0) {
                            disagreePeople += '<br />';
                        }
                        disagreePeople += postAuthor;
                    }
                    disagree++;
                    break;
                case 'clarify':
                    var d3 = clarifyPeople.indexOf(postAuthor);
                    // Do not add if author already exists
                    if (d3 == -1) {
                        if (clarifyPeople.length > 0) {
                            clarifyPeople += '<br />';
                        }
                        clarifyPeople += postAuthor;
                    }
                    clarify++;
                    break;
                case 'offTopic':
                    var d4 = offTopicPeople.indexOf(postAuthor);
                    // Do not add if author already exists
                    if (d4 == -1) {
                        if (offTopicPeople.length > 0) {
                            offTopicPeople += '<br />';
                        }

                        offTopicPeople += postAuthor;
                    }
                    offTopic++;
                    break;
                default:
                    var d5 = commentPeople.indexOf(postAuthor);
                    // Do not add if author already exists
                    if (d5 == -1) {
                        if (commentPeople.length > 0) {
                            commentPeople += '<br />';
                        }
                        commentPeople += postAuthor;
                    }
                    comment++;
            }
        }
    }
    commentText = ' ', agreeText = ' ', disagreeText = ' ', clarifyText = ' ', offTopicText = ' ';
    if (comment > 0) {
        commentText = '<span href="#" rel="tooltip" class="postTypeWrap" typeID="comment" title="<b>Comments from: </b><br /> ' + commentPeople + '" > ' + comment + '  <span class="glyphicon glyphicon-comment"></span></span>  ';
    }
    if (agree > 0) {
        agreeText = '<span href="#" rel="tooltip" class="postTypeWrap" typeID="agree" title="<b>People who agreed: </b><br /> ' + agreePeople + '"> ' + agree + '  <span class="glyphicon glyphicon-thumbs-up"></span> </span> ';
    }
    if (disagree > 0) {
        disagreeText = '<span href="#" rel="tooltip" class="postTypeWrap" typeID="disagree" title="<b>People who disagreed:</b><br /> ' + disagreePeople + '"> ' + disagree + '  <span class="glyphicon glyphicon-thumbs-down "></span></span> ';
    }
    if (clarify > 0) {
        clarifyText = '<span href="#" rel="tooltip" class="postTypeWrap" typeID="clarify" title="<b>People that asked to clarify:</b><br /> ' + clarifyPeople + '"> ' + clarify + '  <span class="glyphicon glyphicon-question-sign "></span></span> ';
    }
    if (offTopic > 0) {
        offTopicText = '<span href="#" rel="tooltip" class="postTypeWrap" typeID="offTopic" title="<b>People that marked off topic: </b><br />' + offTopicPeople + '"> ' + offTopic + '  <span class="glyphicon glyphicon-share "></span> </span>  ';
    }
    text = commentText + agreeText + disagreeText + clarifyText + offTopicText;
    return text;
};


Dscourse.prototype.DiscResize = function() {
    /*
     * Resizes component widths and heights on the discussion page
     */
    var main = this;

    // View box calculations
    var boxHeight = $('#vHeatmap').height();
    var boxWidth = $('#vHeatmap').width();
    var offset = $('#vHeatmap').offset().top;
    // Get height of the heatmap object
    var visibleHeight = $(window).height();
    // Get height of visible part of the main section
    var totalHeight = $(document).height();
    // Get height for the entire main section
//    console.log("BoxHeight : " + boxHeight);
//    console.log("visibleHeight : " + visibleHeight);
//    console.log("totalheight : " + totalHeight);

    // Size the box
    var scrollBoxHeight = visibleHeight * boxHeight / totalHeight;
    $('#scrollBox').css({'height': scrollBoxHeight, 'width' : boxWidth + 'px'});

    // Scroll box to visible area
    var offset =  $('#dMain').offset().top;

    var mainScrollPosition = $(window).scrollTop();
    console.log("offset : " + offset);

    var mainHeight = $('#dMain').height();
    var boxScrollPosition = mainScrollPosition * boxHeight / mainHeight;
    $('#scrollBox').css('margin-top', boxScrollPosition);
    // Gives the correct scrolling location to the box


};

Dscourse.prototype.ClearVerticalHeatmap = function() {
    /*
    * Clear heatmap for reuse
    */
    $('#vHeatmap').html('').append('<div id="scrollBox"> </div>');
};

Dscourse.prototype.VerticalHeatmap = function(mapType, mapInfo) {
    /*
     * Draw the components of the heatmap
     */

    var main = this;
    main.activeFilter = (typeof mapType !="undefined")?mapType: main.activeFilter;
    // View box calculations
    var boxHeight = $('#vHeatmap').height();
    var boxWidth = $('#vHeatmap').width();
    // Get height of the heatmap object
    var visibleHeight = $(window).height();
    // Get height of visible part of the main section
    var totalHeight = $('#dMain').height();
    // Get height for the entire main section


    if (mapType == 'user') {// if mapType is -user- mapInfo is the user ID
        console.log('vertica heatmap: user');
        $('.threadText').filter(':visible').each(function() {// Go through each post to see if postAuthorId in Divs is equal to the mapInfo
            var postAuthor = $(this).attr('postAuthorId');
            var postID = $(this).attr('level');
            if (postAuthor == mapInfo) {
                var divPosition = $(this).position();
                // get the location of this div from the top

                // dynamically find.
                var mainDivTop = $(document).scrollTop();
                console.log('main div scroll: ' + mainDivTop);
                console.log(divPosition);
                var ribbonMargin = (divPosition.top + mainDivTop) * boxHeight / totalHeight;
                // calculate a yellow ribbon top for the vertical heatmap
                ribbonMargin = ribbonMargin; // this correction is for better alignment of the lines with the scroll box.

                // There is an error when the #dMain layer is scrolled the position value is relative so we have minus figures.

                $('#vHeatmap').append('<div class="vHeatmapPoint" style="margin-top:' + ribbonMargin + 'px; width: '+boxWidth+'px" divPostID="' + postID + '" ></div>');
                // append the vertical heatmap with post id and author id information (don't forgetto create an onclick for this later on)
            }
        });
    }

    if (mapType == 'keyword') {// if mapType is -keyword- mapInfo is the text searched
        main.ClearKeywordSearch('#dMain');
        //console.log(mapInfo); // Works
        $('.threadText').each(function() {// go through each post to see if the text contains the mapInfo text
            var postID = $(this).attr('level');
            var postContent = $(this).children('.postTextWrap').children('.postMessageView').text();
            //search for keyword
            var a = postContent.search(RegExp(mapInfo, 'gi'));
            // search for post text with the keyword text if there is a match get location information
            if (a != -1) {
                var divPosition = $(this).position();
                // get the location of this div from the top
                //console.log(divPosition);
                var mainDivTop = $(document).scrollTop();
                var ribbonMargin = (divPosition.top + mainDivTop) * boxHeight / totalHeight;
                // calculate a yellow ribbon top for the vertical heatmap
                $('#vHeatmap').append('<div class="vHeatmapPoint" style="margin-top:' + ribbonMargin + 'px; width: '+boxWidth+'px" divPostID="' + postID + '" ></div>');
                // append the vertical heatmap with post id and author id information (don't forgetto create an onclick for this later on)
               }
                var replaceText = $(this).children('.postTextWrap').children('.postMessageView').html();
                if(!!replaceText){
                 // Find out if there is alreadt a span for highlighting here
                replaceText = replaceText.replace(/(?:<span class=\"highlightblue\">|<\/span>)/gi,"");
                replaceText = replaceText.replace(RegExp(mapInfo, 'gi'), function(capture){
                   return "<span class=\"highlightblue\">"+capture+"</span>"; 
                });
               // var newSelected = '<search class="highlightblue">' + mapInfo + '</search>';
                //var n = replaceText.replace(RegExp(mapInfo.replace(/[#-}]/gi, '\\$&'), 'g'), newSelected);
                $(this).children('.postTextWrap').children('.postMessageView').html(replaceText);
            }
        });

    }

    //main.DrawShape();
    if(!mapInfo){mapInfo = 'null'}; if(!mapType){mapType = 'null'};
};

Dscourse.prototype.UniqueParticipants = function() {
    /*
     *  Returns html for unique participant buttons in the discussion Participant section.
     */
    var main = this;
    var btn = $('<button>').addClass('uList');
    var pflow = $('#participantListOverflow');
    var plist = $('#participantList');
    $('body').append(btn);
    var width = btn.width()+4;
    btn.remove();
    
    var maxWidth =  $('#keywordSearchDiv').position().left - (plist.position().left+plist.children().eq(0).width())+50;
    var maxIcons = Math.floor(maxWidth/width)-1;
    
    $('.uList').remove();
    var i, o, name, thumb, output;
    for ( i = 0; i < main.uParticipant.length; i++) {
        o = main.uParticipant[i];
        name = main.getName(o);
        thumb = main.getAuthorThumb(o, 'small');
        output = '<button class="btn uList" rel="tooltip" active="false" title="' + name + '" authorID="' + o + '">' + thumb + ' </button>';
        if(i < maxIcons)
            $('#participantList').append(output);
        else if(i==maxIcons){
            $('#participantList').append($('<button class="btn uList" rel="tooltip" active="false" style="height:30px;"><span style="text-align:center">ALL</span></button>').on('click', function(){
                $('#participantListOverflow').toggle();
            }));
            $('#toolbox').append($('<div>',{
                id: 'participantListOverflow'
            }).hide());
            $('#participantListOverflow').append(output);
        }
        else{
            $('#participantListOverflow').append(output);        
        }
    }
    if(pflow.length>0)
        pflow.css({
            position: 'absolute',
            left: $('#participantList').children().eq(1).offset().left+'px',
            width: maxWidth-width +'px',
            height: 'auto',
            zIndex: 1000
         });
};

Dscourse.prototype.DrawTimeline = function()// Draw the timeline.
{
    /*
     *  Draw the timeline for the selected discussion
     */
    var main = this;

    // Let's make the step a division between the max and min numbers.
    var min = new Date(main.timelineMin).getTime();
    var max = new Date(main.timelineMax).getTime();
     var step = (max - min) / 100;

    // Create the Slider
    $("#slider-range").slider({// Create the slider
        range : "min",
        //step: step,
        value : max,
        min : min,
        max : max,
        slide : function(event, ui) {
            var date = main.GetUniformDate(ui.value);
            date = main.ToTimestamp(date);
        date = main.FormattedDate(date); 
            $("#amount").val(date);
            $('.threadText').each(function(index) {
                var threadID = $(this).attr('time');
                if (threadID > ui.value) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
            main.ClearVerticalHeatmap();
            main.VerticalHeatmap('user', $('.uList[active="true"]').attr('authorid'));
        },
        stop : function() {

        }
    });

    // Show the value on the top div for reference.
    var initialDate = (main.ToTimestamp(main.GetUniformDate(main.timelineMax)));
        initialDate = main.FormattedDate(initialDate); 

    $("#amount").val(initialDate);

    var j, d;
    for ( j = 0; j < main.data.posts.length; j++) {// Go through all the posts
        d = main.data.posts[j];
        //add dot on the timeline for this post
        var n = d.postTime;
        n = n.replace(/-/g, "/");
        //n = main.ParseDate(n, 'yyyy/mm/dd');
        var time = Date.parse(n);
        var minTime = main.timelineMin.replace(/-/g, "/");
            minTime = Date.parse(minTime);
        var maxTime = main.timelineMax.replace(/-/g, "/");
            maxTime = Date.parse(maxTime);
        var timeRange = maxTime - minTime;
        var dotDistance = ((time - minTime) * 100) / timeRange;
        console.log('n: ' + n + '   timeRange: ' + timeRange + '    timelineMax: ' + main.timelineMax + '     timelineMin: ' + main.timelineMin)
        var singleDotDiv = '<div class="singleDot" style="left: ' + dotDistance + '%; "></div>';
        $('#dots').append(singleDotDiv);
    }

}

Dscourse.prototype.ToTimestamp = function(epoch){
    var d = new Date(epoch);
    var y = d.getFullYear();
    var m = ("00"+(d.getMonth()+1).toString()).slice(-2);
    var da = ("00"+d.getDate().toString()).slice(-2);
    var h = ("00"+d.getHours().toString()).slice(-2);
    var mi = ("00"+d.getMinutes().toString()).slice(-2);
    var s = ("00"+d.getSeconds().toString()).slice(-2);
    
    return y+"-"+m+"-"+da+" "+h+":"+mi+":"+s;
}

Dscourse.prototype.FormattedDate = function(date) {
    
    date = date.replace(/\//g,'-');
    // Split timestamp into [ Y, M, D, h, m, s ]
    var b = date.split(/[- :]/);
    var date = new Date(b[0], b[1]-1, b[2], b[3], b[4], b[5]);

    var d, m, curr_hour, dateString;
    d = new Date(0);
    var sec = this.GetUniformDate(date);
    d.setUTCMilliseconds(sec);
    // Write out the date in readable form.
    console.log(date);
    m = d.toDateString();
    curr_hour = d.getHours();
    dateString = m + '  ' + curr_hour + ':00';
    //console.log(dateString);
    return dateString;
}

Dscourse.prototype.ClearPostForm = function() {
    var main = this;
    $('#commentWrap').find('input:text, input:password, input:file, select, textarea').val('');
    $('.postBoxRadio').removeAttr('checked');
    // Restore checked status to comment.
    $('#postTypeID > button').removeClass('active');
    $('#postTypeID > #comment').addClass('active');
    $('#highlightShow').html(' ');
    $('#text').removeClass('textErrorStyle');
    $('#textError').hide();
}

Dscourse.prototype.AddPost = function() {

    var main = this;

    // If there are no posts in this discussion create posts array
    if (!main.data.posts) {
        main.data.posts = new Array();
    }
    
    // Get post values from the form.
    var postFromId = main.currentReplyPost;

    // author ID -- postAuthorId -- this is the session user
    var postAuthorId = main.data.currentUser.userId;
    var postMessage = $('#text').val();

    // type -- postType
    var postType = 'comment';
    var formVal = $('#postTypeID > .active').attr('id');
    if (formVal !== undefined) {
        postType = formVal;
    }

    // locationIDhidden -- postSelection
    var postSelection = $('#locationIDhidden').val();
    console.log(postSelection);
    if (postSelection == '0,0') {// fix for firefox and fool proofing in case nothing is actually selected.
        postSelection = '';
    }

    // Get drawing value
    var postMedia = '';
    postMedia = (main.currentDrawing!="Unrecognized")?main.currentDrawing:"";
    console.log(postMedia);
    var postContext = '';

    // Create post object and append it to allPosts
    var post = {
        'postFromId' : postFromId,
        'postAuthorId' : postAuthorId,
        'postMessage' : postMessage.replace('\'', '\\\''),
        'postType' : postType,
        'postSelection' : postSelection,
        'postMedia' : postMedia,
        'postMediaType' : main.postMediaType,
        'postContext' : postContext,
        'postTime'  : main.GetCurrentDate()
    };

    post.postMessage = post.postMessage.replace(/\W/g,function(match){return match.replace('\\','');});
    post.postPage = 1; // Get this value from the page.

    console.log(postFromId);
    if(/EDIT/.test(postFromId)){
        console.log('postfromID value: ' + postFromId);
        var editPost = {
            postId: postFromId.split('|||')[1],
            postFromId : postFromId.split('|||')[2],
            postAuthorId : postAuthorId,
            postMessage : postMessage.replace('\'', '\\\''),
            postType : postType,
            postSelection : postSelection,
            postMedia : postMedia,
            postMediaType : main.postMediaType,
            postContext : postContext
        };

        $.ajax({// Add user to the database with api.
            type : "POST",
            url : main.api,
            data : {
                action : 'EditPost',
                post : editPost
            },
            success : function(data) {
                console.log(data);
                main.GetData();
                main.RebuildPosts();

            },
            error : function(xhr, status) {// If there was an error
                console.log('There was an error talking to data.php');
                console.log(xhr);
                console.log(status);
            }
        });


    } else {
        $.ajax({
            type : "POST",
            url : main.api,
            data : {
                post : post,
                action : 'AddPost'
            },
            success : function(data) {// If connection is successful .
                console.log(data);
                main.GetData();
                var divHighlight = 'div[level="' + data + '"]';
                $(divHighlight).removeClass('agree disagree comment offTopic clarify').addClass('highlight animated flash');
                $(document).scrollTo($(divHighlight), 400, {
                    offset : -100
                });
            },
            error : function(data) {// If connection is not successful.
                console.log(data);
                console.log("Dscourse Log: the connection to data.api failed. Did not save post");
            }
        });
    }




};


Dscourse.prototype.Initials = function (fullname) {
    var matches = fullname.match(/\b(\w)/g);
    var initials = matches.join('');
    return initials;
}

Dscourse.prototype.ClearKeywordSearch = function(selector) {
    /*
     * Clear keyword search properly
     */
    var main = this;
    $(selector).find('span:not(:has(*))').filter('.highlightblue').contents().unwrap();
}


Dscourse.prototype.GetCurrentDate = function() {
    var x = new Date();
    var monthReplace = (x.getUTCMonth() < 10) ? '0' + (x.getUTCMonth() + 1) : x.getUTCMonth();
    var dayReplace = (x.getUTCDate() < 10) ? '0' + x.getUTCDate() : x.getUTCDate();
    return x.getUTCFullYear() + '-' + monthReplace + '-' + dayReplace + ' ' + x.getUTCHours() + ':' + x.getUTCMinutes() + ':' + x.getUTCSeconds();
}

Dscourse.prototype.HighlightRelevant = function(postID) {
    /*
     *  Highlights the relevant sections of host post when hovered over
     */
    var main = this;
    // First remove all highlights anywhere
    $('.postTextWrap').find('.highlight').removeClass('highlight');
    // Find all postTextWrap spans with class highlight and remove class highlight.

    // get selection of this post ID
    var i, o, thisSelection, j, m, highlight, newHighlight, n, selector;
    var f = main.data.posts.filter(function(a){
        return a.postID == postID;
    });
    if(f.length > 0){
        o = f[0];
        if (o.postSelection) {// If there is selection do highlighting
            thisSelection = o.postSelection.split(",");
            var num1 = parseInt(thisSelection[0]);
            var num2 = parseInt(thisSelection[1]);
            // var num3 = num2-num1;   // delete if substring() works.
            // find the selection in reference post
            var ref = main.data.posts.filter(function(a){
                return a.postID == o.postFromId;
            })[0];
            highlight = ref.postMessage.substring(num1, num2);
            newHighlight = '<span class="highlight">' + highlight + '</span>';
            n = ref.postMessage.substring(0, num1)+newHighlight+ref.postMessage.substring(num2);
            selector = 'div[level="' + o.postFromId + '"]';
            $(selector).children('.postTextWrap').children('.postMessageView').html(n);
        } else {
            // If there is no selection remove highlighting     -- Check This --TODO
        }
    }
}

Dscourse.prototype.GetSelectedText = function()// Select text
{
    var main = this;

    var text;

    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }

    return text;
};

Dscourse.prototype.GetSelectedLocation = function(element)// Data about begin and end of selection
{
    var main = this;

    var start = 0, end = 0;
    var sel, range, priorRange;
    if ( typeof window.getSelection != "undefined") {
        range = window.getSelection().getRangeAt(0);
        priorRange = range.cloneRange();
        priorRange.selectNodeContents(element);
        priorRange.setEnd(range.startContainer, range.startOffset);
        start = priorRange.toString().length;
        end = start + range.toString().length;
    } else if ( typeof document.selection != "undefined" && ( sel = document.selection).type != "Control") {
        range = sel.createRange();
        priorRange = document.body.createTextRange();
        priorRange.moveToElementText(element);
        priorRange.setEndPoint("EndToStart", range);
        start = priorRange.text.length;
        end = start + range.text.length;
    }
    return {
        start : start,
        end : end
    };
};


