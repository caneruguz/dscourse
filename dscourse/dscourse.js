/*
*  All dscourse related code
*/

function Dscourse() {
    //Done : Adjust showing and hiding subposts, as well as the reply, they are not getting the correct jquery resources because of location change.
    //TODO: Finalize Connected posts: 2 Connected posts does not take you to their original location. Show and hide posts quirky behavior. clicking on connected post itself should take you there.
    //Done : Add Media
    //Done: Search reset
    // TODO: Make responsive
    // TODO: Add delete
    // TODO: Clean up api connections
    // TODO: Visual enhancements
    // TODO: Code clean up


    // Set global variables
    var top = this;
    // Main discussion data wrapper
    this.data = new Array();

    this.colors = [];
    this.currentUserID = 0;
    this.currentUserRole = 'student';
    this.currentDrawing = '';
    this.currentMediaType = '';
    this.postMediaType = 'draw';
    this.currentReplyPost = 0;
    // Options for what to show and hide etc.
    this.options = {
        charLimit : 500,
        synthesis : true,
        infoPanel : true,
        media : true,
        timeline : true
    }


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
        var replaceText = $('#highlightShow').html();
        var newSelected = '<span class="highlight">' + top.currentSelected + '</span>';
        var n = replaceText.substring(0,range.start)+newSelected+replaceText.substring(range.end);
        $('#highlightShow').html(n);
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

        $(this).find('.deletePostButton').show();
        var aID = $(this).attr('postauthorid');
        var pID = $(this).attr('level');
        var time = top.GetUniformDate(top.data.posts.filter(function(a){return a.postID == pID})[0].postTime) > new Date().getTime() - (15000+1000*240);
        if((aID == top.currentUserID && time)|| top.currentUserRole=="Instructor"|| top.currentUserRole=="TA")
            $(this).find('.editPostButton').show();
    });

    /* When mouse hovers out of the post */
    $(document).on('mouseout', '.threadText', function(event) {
        event.stopImmediatePropagation();
        $(this).children('.sayBut2').hide();
        $(this).removeClass('lightHighlight');
        $(this).find('.deletePostButton').hide();
        $(this).find('.editPostButton').hide();
    });

    /* When there are new posts and a refresh is required */
    
    $(document).on('click', '.refreshBox', function() {
        $(this).hide();
        var discID = $(this).attr('discID');
        top.GetData();
        // We load our new discussion with all the posts up to date
    });

    // When the main window scrolls heatmap needs to redraw
    $('#dMain').scroll(function() {
        top.VerticalHeatmap();
        top.DrawShape();
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
            var discussionID = $('#dIDhidden').val();
            $('#commentWrap').slideUp();
            $('#overlay').hide();
            $('#shivaDrawDiv').hide();
            $('#shivaDrawPaletteDiv').hide();
            top.ClearPostForm();
            $('.threadText').removeClass('yellow');
            top.DiscResize();
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

    $('#text').on('keyup', function() {
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
        $('#overlay').show();
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

    /* When user decides to turn a comment into a synthesis post instead */
    $(document).on('click', '#synthesize', function() {
        $('#synthesisPostWrapper').html('');
        // Clear existing posts
        $('#synthesisText').val('');
        $('#addSynthesis').removeAttr('synthesisID');
        // Get rid of comment tab -- we need to be able to carry the content and info for this.
        $('.threadText').removeClass('highlight');
        $('#commentWrap').fadeOut();
        $('#overlay').hide();
        $('#shivaDrawDiv').hide();
        $('#shivaDrawPaletteDiv').hide();
        // Synthesis side
        var synthesisFromID = top.currentReplyPost;
        console.log('synthesisFromID: ' + synthesisFromID);
        // Get post from ID to the global variable
        var synthesisComment = $('#text').val();
        console.log('synthesisComment: ' + synthesisComment)
        // Get comment content to the global variable
        var postQuote = $('div[level="' + synthesisFromID + '"]').children('.postTextWrap').children('.postMessageView').html();
        console.log('postQuote: ' + postQuote)
        // Get the post content
        if (postQuote) {
            postQuote = top.truncateText(postQuote, 30);
            // Shorten the comment to one line.
        }
        $('#addSynthesis').show();
        $('#editSynthesisSaveButton').hide();
        // show editSynthesisSaveButton
        $('#addSynthesisButton').show();
        // hide addSynthesisButton

        $('.dCollapse').hide();
        // hide every dCollapse
        var selector = '.dCollapse[id="dSynthesis"]';
        $(selector).slideDown();
        // show the item with dTab id

        $('#synthesisText').val(synthesisComment);
        // Carry over synthesis comment text
        top.currentReplyPost = 0;
        // Set default from id as 0, this can be overridden below

        $('#synthesisText').on('click', function() {
            if ($(this).val() == 'Your comment...')
                $(this).val('');
        });

        // Populate the fields for the synthesis if the source is not top level
        if (synthesisFromID != 0) {
            top.currentReplyPost = synthesisFromID;
            $('#synthesisPostWrapper').prepend('<div sPostID="' + synthesisFromID + '" class="synthesisPosts">' + postQuote + ' <div>');
            // Append original post
        }
        top.ClearPostForm();
    });

    /* When user clicks on the posts inside synthesis */
    $(document).on('click', '.synthesisPosts', function(event) {
        event.stopImmediatePropagation();
        var thisPost = $(this).attr('sPostID');
        var postRef = 'div[level="' + thisPost + '"]';
        $('#dMain').scrollTo($(postRef), 400, {
            offset : -100
        });
        $(postRef).addClass('animated flash').css('background-color', 'rgba(255,255,176,1)').delay(5000).queue(function() {
            $(this).removeClass('highlight animated flash').css('background-color', '#fff');
            $(this).dequeue();
        });
        $('.synthesisPosts').css('background-color', '#FAFDF0')// Original background color
        $(this).addClass('animated flash').css('background-color', 'rgba(255,255,176,1)');
        // Change the background color of the clicked div as well.
    });

    /* When user clicks on discuss this post on synthesis */
    $(document).on('click', '.gotoSynthesis', function(event) {
        event.stopImmediatePropagation();
        var thisPost = $(this).attr('gotoID');
        var postRef = 'div[level="' + thisPost + '"]';
        $('#dMain').scrollTo($(postRef), 400, {
            offset : -100
        });
        $(postRef).addClass('animated flash').css('background-color', 'rgba(255,255,176,1)').delay(5000).queue(function() {
            $(this).removeClass('highlight animated flash').css('background-color', '#fff');
            $(this).dequeue();
        });
    });

    /* Adding a new synthesis post */
    $(document).on('click', '#addSynthesisButton', function() {
        top.AddSynthesis();
    });

    /* Adding a new synthesis post */
    $(document).on('click', '#editSynthesisSaveButton', function() {
        top.EditSynthesis();
    });

    /* Editing a new synthesis post */
    $(document).on('click', '.editSynthesis', function(event) {
        event.preventDefault();
        if(settings.status!="OK")
            return false;
        $('#dSidebar').animate({
            scrollTop : 0
        });

        // -- show the synthesis form
        $('#synthesisPostWrapper').html('');
        // Clear existing posts
        $('#synthesisText').val('');
        // Clear the comment box
        $('#addSynthesis').show();
        // show the form
        $('#editSynthesisSaveButton').show();
        // show editSynthesisSaveButton
        $('#addSynthesisButton').hide();
        // hide addSynthesisButton
        // -- fill form with the post information
        var postID = $(this).attr('sPostID');
        for (var j = 0; j < top.data.posts.length; j++) {// Go through all the posts
            var d = top.data.posts[j];
            if (d.postID == postID) {
                $('#synthesisText').val(d.postMessage);
                // Clear the comment box
                top.currentReplyPost = d.postFromId;
                $('#addSynthesis').attr('synthesisID', postID);
                top.ListSynthesisPosts(d.postContext, d.postID, 'edit');
            }

        }
    });

    /* Removing a post from synthesis */
    $(document).on('click', '.removeSynthesisPost', function(event) {
        event.preventDefault();
        $(this).parent().remove();
    });

    /* Single synthesis wrapper click event */
    $(document).on('click', '.showPosts', function() {
        if ($(this).hasClass('on') == true) {
            $(this).parents('.synthesisPost').children('.synthesisPosts').fadeOut();
            // hide posts
            $(this).removeClass('on').addClass('off');
            // add class off
            $(this).text('Show Posts')
        } else {
            $(this).parents('.synthesisPost').children('.synthesisPosts').fadeIn();
            // show posts
            $(this).removeClass('off').addClass('on');
            // add class on
            $(this).text('Hide Posts')
        }

    });

    /* Show which post is synthesized */
    $(document).on('click', '.SynthesisComponent', function() {
        var thisPost = $(this).attr('synthesisSource');
        var postRef = '.synthesisPost[sPostID="' + thisPost + '"]';
        $('#dSidebar').scrollTo($(postRef), 400, {
            offset : -100
        });
        $(postRef).addClass('animated flash').css('border', '3px solid red').delay(5000).queue(function() {
            $(this).removeClass('highlight animated flash').css('border', '1px solid #ddd');
            $(this).dequeue();
        });
        $('#dInfo').fadeOut();
        // hide #dInfo
        $('#dSynthesis').fadeIn();
        // show #synthesis

    });

    /* When user cancels synthesis creation */
    $(document).on('click', '#cancelSynthesisButton', function() {
        $('#addSynthesis').slideUp('fast');
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

    /* When posttype is collapes or opened up make style changes */
    $(document).on('click', '.postTypeWrap', function() {
        var currentType = $(this).attr('typeID');
        var thisLink = $(this).children('.typicn');
        currentType = '.threadText[postTypeID="' + currentType + '"]';
        var parentDiv = $(this).closest('.threadText');
        $(parentDiv).children(currentType).fadeToggle('fast', function() {
        });
        if (thisLink.hasClass('grey-icons') == true) {
            thisLink.removeClass('grey-icons');
        } else {
            thisLink.addClass('grey-icons');
        }
    });

    /* Add button effect to the post type information */
    $(document).on('mousedown', '.postTypeWrap', function() {// This is just for style to make it look like a button.
        $(this).addClass('buttonEffect');
    });

    $(document).on('mouseup', '.postTypeWrap', function() {
        $(this).removeClass('buttonEffect');
    });

    /* When show timeline button is clicked */
//    $(document).on('click', '#showTimeline', function() {
//        $('#timeline').slideToggle().queue(function() {
//            top.DiscResize();
//            top.VerticalHeatmap();
//            $(this).dequeue();
//        });
//        if ($(this).hasClass('active') == true) {
//            $(this).removeClass('active');
//        } else {
//            $(this).addClass('active');
//        }
//        top.DiscResize();
//        top.VerticalHeatmap();
//    });

    /* When show synthesis button is clicked */
    $(document).on('click', '#showSynthesis', function() {
        $('#dInfo').fadeToggle();
        console.log('showsynthesis');
        // toggle hide sidebar content
        $('#dSynthesis').fadeToggle();
        if ($(this).hasClass('active') == true) {
            $(this).html('Show Connected Posts');
            $(this).removeClass('btn-primary');
            $(this).addClass('btn-warning');
            $(this).removeClass('active');
        } else {
            $(this).html('Show Recent Posts');
            $(this).removeClass('btn-warning');
            $(this).addClass('btn-primary');
            $(this).addClass('active');
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
            top.DiscResize();
            top.VerticalHeatmap();
            $('#containerDiv').css('width', '100% !important');
            $(this).dequeue();
        });
    });
    /* When items in the recent contents section are clicked */
    $(document).on('click', '#recentContent li', function() {
        var postID = $(this).attr('postid');
        var postRef = 'div[level="' + postID + '"]';
        $('#dMain').scrollTo($(postRef), 400, {
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
        $('#dMain').scrollTo($(postRef), 400, {
            offset : -100
        });
        $(postRef).removeClass('agree disagree comment offTopic clarify').addClass('animated flash').css('background-color', 'rgba(255,255,176,1)').delay(5000).queue(function() {
            $(this).removeClass('highlight animated flash').css('background-color', '#fff');
            $(this).dequeue();
        });
        $('.vHeatmapPoint').removeClass('highlight');
        $(this).addClass('highlight');
    });
    /* Show synthesis post numbers next to post. Needs event control, hide and show propagate. TODO */
    $(document).on('mouseover', '.synthesisWrap', function(event) {
        $(this).children('span').fadeIn('slow');
    });
    $(document).on('mouseout', '.synthesisWrap', function(event) {
        $(this).children('span').fadeOut('slow');
    });
    $(document).on('childClick', '.synthesisWrap', function(item){
            var thisPost = item.attr('synthesissource');
            var postRef = '.synthesisPost[sPostID="' + thisPost + '"]';
            $('#dSidebar').scrollTo($(postRef), 400, {
                offset : -100
            });
            $(postRef).addClass('animated flash').css('background-color', 'rgba(255,255,176,1)').delay(5000).queue(function() {
                item.removeClass('highlight animated flash').css('background-color', 'whitesmoke');
                item.dequeue();
            });
            $('#dInfo').fadeOut();
            // hide #dInfo
            $('#dSynthesis').fadeIn();
            // show #synthesis
    });
    $(window).resize(function() {// When window size changes resize
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
    });


};

Dscourse.prototype.GetData = function() {
    /*
     *	Loads all the data needed for the discussion page
     */

    var main = this;

    // Ajax call to get data and put all data into json object
    $.ajax({ 
        type : "GET",
        url : "dscourse/sampledata.json",
        dataType : "json",
        success : function(data) {
            main.data = data;
            main.currentUserID = data.currentUser.userId; 
            main.SingleDiscussion();
            main.currentUserID = data.currentUser.userId;
            main.currentUserRole = data.currentUser.userRole;
        },
        error : function(xhr, status) { // If there was an error
            console.log('There was an error getting data.');
            console.log(xhr);
            console.log(status);
        }
    });

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
    $('#participantList').html('<button class="btn btn-sm disabled">Participants: </button>');
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
        if(d.postSelection.length > 1){
        selection = ' <span href="#" rel="tooltip" title="This post has highlighted a segment in the parent post. Click to view." class="selectionMsg" style="display:none;">a</span> ';
        } 

        // Check if this post has media assigned.
        var media = '';
        if (d.postMedia.length > 1) {
            media = '<span href="#" rel="tooltip" title="This post has a ' + d.postMediaType + ' media attachment. Click to view." class="mediaMsg"> ' + d.postMediaType + '  <span class="typicn tab "></span> </span> ';
        }
        console.log(d.postMedia);

        var showPost = 'yes';

        // Is this post part of any synthesis?
        var synthesis = '';
        synthesis = main.PostInSynthesis(d.postID);

        if (showPost == 'yes') {

            var selector = 'div[level="' + d.postFromId + '"]';
            var responses = main.ResponseCounters(d.postID);

            $(selector).append(// Add post data to the view
            		'<div class="threadText ' + topLevelMessage + '" level="' + d.postID + '" postTypeID="' + d.postType + '" postAuthorId="' + d.postAuthorId + '" time="' + time + ' ">'
            		+  '<div class="postTypeView" slevel="' + d.postID + '"> ' + typeText + '</div>' 
            		+ '<div class="postTopRow"><span class="postAuthorView" rel="tooltip"  title="' + authorThumb + '"> ' + authorID + '</span><div class="postMeta"> <span class="postMetaBtn replyPost sayBut2" postID="' + d.postID + '"> <span class="typicn plus "></span>  Reply </span><div class="postMetaBtn responseWrap" >' + responses + '</div></div></div>'
                        +  '<div class="postTextWrap">'
            			             			 + '<span class="postMessageView"> ' + message + '</span>'
            			 + ((userRole == 'Instructor' || userRole == "TA")?'<i class="icon-trash deletePostButton" style="float:right; position:relative;top: 3px"></i>':'') 
            			 + '<i class="icon-edit editPostButton" style="float:right; position: relative;top:3px; right:5px"></i>'
            			 + media + selection + synthesis 
            		 + '</div>' 
            		 //+ ' <button class="btn btn-sm btn-success sayBut2" style="display:none" postID="' + d.postID + '"> <span class="typicn plus "></span>  </button> '

            		+ '</div>'
            );

            /********** SYNTHESIS POSTS ***********/
            if (d.postType == 'synthesis') {
//                if ((currentUserID == d.postAuthorId) || (userRoleAuthor == 'Instructor' || userRoleAuthor == 'TA')) {
//                    var editPostButton = '<button class="btn btn-sm editSynthesis" sPostID="' + d.postID + '">Edit</button> ';
//                } else {
//                    var editPostButton = '';
//                }

                $('#synthesisList').prepend('<div class="synthesisPost " sPostID="' + d.postID + '"><span class="postAuthorView" rel="tooltip" > ' + authorThumb + '</span>' + '		<p class="synthesisP">' + message + '</p>' + '		<div class="synthesisButtonWrap"> <button class="gotoSynthesis btn btn-xs" gotoID="' + d.postID + '"> Go to Post </button><button class="showPosts btn btn-xs">Show Posts</button></div>' + '	</div>');
                main.ListSynthesisPosts(d.postContext, d.postID, 'add');
                synthesisCount = 'some';
            }

            var pTime = main.GetUniformDate(d.postTime);


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

        } ;// end if showpost.
    };// End looping through posts
    
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
                    main.SingleDiscussion();
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
                    participate = (settings.status=="OK");
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
                        top.currentReplyPost = postID ;
                        $('#overlay').show();
                        $('#commentWrap').fadeIn('fast');
                        $(this).parent('.threadText').removeClass('agree disagree comment offTopic clarify').addClass('highlight');
                        $('#text').val(parentPost.postMessage);
                        $.scrollTo($('#commentWrap'), 400, {
                            offset : -100
                        });
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
}

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
}
Dscourse.prototype.PostInSynthesis = function(postID) {
    /*
     *  Checks to see if this posts is in a synthesis so a notification can be drawn next to the post.
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

Dscourse.prototype.DiscResize = function() {
    /*
     * Resizes component widths and heights on the discussion page
     */
    var main = this;
    var wHeight, wWidth,  height, mHeight;

    var wrapper = $('#dRowMiddle');

    wHeight = $(window).height();
    wWidth = $(window).width();

    // resize #dRowMiddle accordingly.
    height = wrapper.height();
    mHeight = -height;

      $('#dSidebar').css({
        'height' : height+'px',
        'overflow-y' : 'scroll',
        'overflow-x' : 'hidden'
    });
    $('#vHeatmap').css({
        'height' : height+'px',
        'overflow-y' : 'hidden',
        'overflow-x' : 'hidden'
    });
    $('#dMain').css({
        'height' : height+'px',
        'overflow-y' : 'scroll',
        'overflow-x' : 'hidden'
    });
    $('#dRowMiddle').css({
        'margin-top' : 10
    });
    $('#lines').css({
        'height' : height+'px',
        'margin-top' : mHeight + 'px'
    });
    $('#mediaBox').css({
        'height' : wHeight - 200 + 'px'
    });
    $('#node').css({
        'height' : wHeight - 300 + 'px'
    });
    $('#homeWrapper').css({
        'width' : wWidth - 600 + 'px'
    });

    //=== CORRECT Vertical Heatmap bars on resize  ===
    // Each existing heatmap point needs to be readjusted in terms of height.
    // View box calculations
    var boxHeight = $('#vHeatmap').height();
    var boxWidth = $('#vHeatmap').width();
    // Get height of the heatmap object
    var totalHeight = $('#dMain')[0].scrollHeight;
    // Get height for the entire main section

    $('#scrollBox').css({
        'width' : boxWidth + 'px'
    });

    $('.vHeatmapPoint').each(function() {
        var postValue = $(this).attr('divPostID');
        // get the divpostid value of this div

        var thisOne = $(this);
        // redraw the entire thing.
        $('.threadText').each(function() {// Go through each post to see if postAuthorId in Divs is equal to the mapInfo
            var postAuthor = $(this).attr('postAuthorId');
            var postID = $(this).attr('level');
            if (postID == postValue) {
                var divPosition = $(this).position();
                // get the location of this div from the top
                //console.log(divPosition);
                var ribbonMargin = (divPosition.top) * boxHeight / totalHeight;
                // calculate a yellow ribbon top for the vertical heatmap
                ribbonMargin = ribbonMargin;
                // this correction is for better alignment of the lines with the scroll box.

                // There is an error when the #dMain layer is scrolled the position value is relative so we have minus figures.
                console.log(boxWidth);
                $(thisOne).css({'margin-top': ribbonMargin, 'width' : boxWidth + 'px'});
            }
        });
    });
    // ==  end correct vertical heatmap
    $('#displayFrame').css({
        'height' : wHeight - 200 + 'px'
    });
    $('#displayIframe').css({
        'height' : wHeight - 250 + 'px'
    });
    //Fixing the width of the threadtext
    $('.threadText').each(function() {
        var parentwidth = $(this).parent().width();
        var parentheight = $(this).children('.postTextWrap').height();
        var thiswidth = parentwidth - 2;
        $(this).css({
            'width' : thiswidth + 'px',
            'padding-left' : '40px'
        });
        $(this).children('.postTypeView').css('width', '20px');
        $(this).children('.sayBut2').css({
            'width' : '30px',
            'height' : parentheight + 10 + 'px'

        });
        $(this).children('.responseWrap').css('width', '40px');
        $(this).children('.postTextWrap').css('width', thiswidth - 65 + 'px');
    });
    main.UniqueParticipants();
}

Dscourse.prototype.ClearVerticalHeatmap = function() {
    /*
    * Clear heatmap for reuse
    */
    // Check to see how clearing will function, this is probably the place for it.
    $('#vHeatmap').html('');
    $('#vHeatmap').append('<div id="scrollBox"> </div>');
    // Add scrolling tool

}

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
    var visibleHeight = $('#dMain').height();
    // Get height of visible part of the main section
    var totalHeight = $('#dMain')[0].scrollHeight;
    // Get height for the entire main section

    // Size the box
    var scrollBoxHeight = visibleHeight * boxHeight / totalHeight;
    $('#scrollBox').css({'height': scrollBoxHeight, 'width' : boxWidth + 'px'});
    // That gives the right relative size to the box

    // Scroll box to visible area
    var mainScrollPosition = $('#dMain').scrollTop();
    var boxScrollPosition = mainScrollPosition * boxHeight / totalHeight;
    $('#scrollBox').css('margin-top', boxScrollPosition);
    // Gives the correct scrolling location to the box

    if (mapType == 'user') {// if mapType is -user- mapInfo is the user ID
        console.log('vertica heatmap: user');
        $('.threadText').filter(':visible').each(function() {// Go through each post to see if postAuthorId in Divs is equal to the mapInfo
            var postAuthor = $(this).attr('postAuthorId');
            var postID = $(this).attr('level');
            if (postAuthor == mapInfo) {
                var divPosition = $(this).position();
                // get the location of this div from the top

                // dynamically find.
                var mainDivTop = $('#dMain').scrollTop();
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
                var mainDivTop = $('#dMain').scrollTop();
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

    main.DrawShape();
    if(!mapInfo){mapInfo = 'null'}; if(!mapType){mapType = 'null'}; 
}

Dscourse.prototype.UniqueParticipants = function() {
    /*
     *  Returns html for unique participant buttons in the discussion Participant section.
     */
    var main = this;
    var btn = $('<button>').addClass('uList');
    $('body').append(btn);
    var width = btn.width()+4;
    btn.remove();
    
    var maxWidth =  $('#keywordSearchDiv').position().left - ($('#participantList').position().left+$('#participantList').children().eq(0).width())+50;
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
    if($('#participantListOverflow').length>0)
        $('#participantListOverflow').css({
                    position: 'absolute',
                    left: $('#participantList').children().eq(1).offset().left+'px',
                    width: maxWidth-width +'px',
                    height: 'auto',
                    zIndex: 1000
         });
}

Dscourse.prototype.DrawShape = function() {
    /*
     * Draws the lines that connect scrollbox and the discussion window
     */
    var main = this;
    // get the canvas element using the DOM
    var canvas = document.getElementById('cLines');
    var scrollBoxTop = $('#scrollBox').css('margin-top');
    scrollBoxTop = scrollBoxTop.replace('px', '');
    scrollBoxTop = Math.floor(scrollBoxTop);
    var scrollBoxHeight = $('#scrollBox').css('height');
    // find the height of scrollbox
    scrollBoxHeight = scrollBoxHeight.replace('px', '');
    scrollBoxHeight = Math.floor(scrollBoxHeight);
    var linesHeight = $('#lines').height();
    canvas.height = linesHeight;
    var scrollWidth = $('#vHeatmap').width();
   //var correction =  26 - scrollWidth;
    var scrollBoxBottom = scrollBoxHeight + scrollBoxTop;
    // add the height to the top position to find the bottom.
    // use getContext to use the canvas for rawing
    var ctx = canvas.getContext('2d');
    // Clear the drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Options
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(107,107,107)';
    // Top line
    ctx.beginPath();
    ctx.moveTo(0, scrollBoxTop + 1);
    ctx.lineTo(28, 1);
    ctx.stroke();
    ctx.closePath();
    // Bottom line
    ctx.beginPath();
    ctx.moveTo(0, scrollBoxBottom -1);
    ctx.lineTo(28, linesHeight - 1);
    ctx.stroke();
    ctx.closePath();
}

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
    // postID -- postFromId
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
        'postContext' : postContext
    };

    // if the post is not edit then save new.
    post.postMessage = post.postMessage.replace(/\W/g,function(match){return match.replace('\\','');});
    post.postTime = main.GetCurrentDate();
    post.postID = main.data.posts[main.data.posts.length-1].postID+1;
    main.data.posts.push(post);

    $('.levelWrapper[level="0"]').html('');
    main.SingleDiscussion();
    main.DiscResize();
    main.VerticalHeatmap();
    var divHighlight = 'div[level="' + post.postID + '"]';
    $(divHighlight).removeClass('agree disagree comment offTopic clarify').addClass('highlight animated flash');
    $.scrollTo($(divHighlight), 400, {
        offset : -100
        });

}

Dscourse.prototype.DiscDateStatus = function(dID) {
    /*
     *  Checks the date to see if the discussion is active, individual participation or closed.
     */
    var main = this;
    var dStatus;
    // Get course dates:
    var o;
    o = main.data.discussion;
    if (o.dID === dID) {
        // Compare dates of the discussion to todays date.
        var beginDate = main.GetUniformDate(o.dStartDate);
        var openDate = main.GetUniformDate(o.dOpenDate);
        var endDate = main.GetUniformDate(o.dEndDate);
        var currentDate = new Date().getTime();
        // Compare dates of the discussion to todays date. But first convert mysql dates into js
        if (currentDate >= beginDate && currentDate <= endDate) {// IF today's date bigger than start date and smaller than end date?
            if (currentDate <= openDate) {// If today's date smaller than Open Date
                dStatus = 'student';
                // The status is open to individual contribution
            } else {
                dStatus = 'all';
                // The status is open to everyone
            }
        } else {
            dStatus = 'closed';
            // The status is closed.
        }
        return dStatus;
    }
}

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
    var dateNow = x.getUTCFullYear() + '-' + monthReplace + '-' + dayReplace + ' ' + x.getUTCHours() + ':' + x.getUTCMinutes() + ':' + x.getUTCSeconds();
    return dateNow;
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
        if (o.postSelection !== "") {// If there is selection do highlighting
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

Dscourse.prototype.AddSynthesis = function() {// Revise for synthesis posts

    var main = this;

    main.sPostID = '';
    main.sPostContent = '';

    // Get post values from the synthesis form.
    // postID -- postFromId

    var postFromId = main.currentReplyPost;
    // Done
    if (postFromId.length < 1){postFromId = 0 }
    // author ID -- postAuthorId -- this is the session user
    var postAuthorId = main.data.currentUser.userId;;
    // Done
    var postMessage = $('#synthesisText').val();
    // Done

    // type -- postType
    var postType = 'synthesis';

    // locationIDhidden -- postSelection
    var postSelection = ' ';
    // Not done but works.

    var postMedia = '';
    // Synthesis doesn't have media yet.

    var postContext = '';

    $('#synthesisPostWrapper > .synthesisPosts').each(function() {
        if (postContext.length > 0) {
            postContext += ',';
        }
        var thisPostID = $(this).attr('sPostID');
        postContext += thisPostID;

    });
    //console.log('post context ' + postContext);

    // Create post object and append it to allPosts

    post = {
        'postFromId' : postFromId,
        'postAuthorId' : postAuthorId,
        'postMessage' : postMessage,
        'postType' : postType,
        'postSelection' : postSelection,
        'postMediaType' : main.postMediaType,
        'postMedia' : postMedia,
        'postContext' : postContext
    };

    post.postTime = main.GetCurrentDate();
    post.postID =  main.data.posts[main.data.posts.length-1].postID+1;
    main.data.posts.push(post);

    $('#addSynthesis').slideUp('fast');   // Slide up the form, it will be cleared when new synthesis is created
    $('#synthesisList').html(' '); 			// Empty synthesis list
    $('.levelWrapper[level="0"]').html('');  // Empty discussion
    main.SingleDiscussion();		// Rebuild the page
    main.DiscResize();						// Rebuild the sizes of object
    main.VerticalHeatmap();					// Rebuild the heatmap
    var divHighlight = 'div[level="' + post.postID + '"]';
    $(divHighlight).removeClass('agree disagree comment offTopic clarify').addClass('highlight animated flash');
    $.scrollTo($(divHighlight), 400, {
        offset : -100
    });

    // run Ajax to save the post object
//
//    $.ajax({
//        type : "POST",
//        url : "php/data.php",
//        data : {
//            post : post,
//            action : 'addPost',
//            currentDiscussion : currentDisc
//        },
//        success : function(data) {// If connection is successful .
//            post.postTime = main.GetCurrentDate();
//            post.postID = data;
//            main.data.posts.push(post);
//
//            $('#addSynthesis').slideUp('fast');   // Slide up the form, it will be cleared when new synthesis is created
//            $('#synthesisList').html(' '); 			// Empty synthesis list
//            $('.levelWrapper[level="0"]').html('');  // Empty discussion
//            main.SingleDiscussion(currentDisc);		// Rebuild the page
//            main.DiscResize();						// Rebuild the sizes of object
//            main.VerticalHeatmap();					// Rebuild the heatmap
//            var divHighlight = 'div[level="' + data + '"]';
//            $(divHighlight).removeClass('agree disagree comment offTopic clarify').addClass('highlight animated flash');
//            $.scrollTo($(divHighlight), 400, {
//                offset : -100
//            });
//        },
//        error : function(data) {// If connection is not successful.
//            console.log(data);
//            console.log("Dscourse Log: the connection to data.php failed. Did not save synthesis");
//        }
//    });
};


Dscourse.prototype.EditSynthesis = function() {// Revise for synthesis posts

    var main = this;

    main.sPostID = '';
    main.sPostContent = '';

    var currentDisc = $('#dIDhidden').val();
    var editPostID = $('#addSynthesis').attr('synthesisID');

    // Get post values from the synthesis form.
    // postID -- postFromId
    var postFromId = main.currentReplyPost;
    // Done

    // author ID -- postAuthorId -- this is the original poster
    var postAuthorId = main.data.posts.filter(function(item){
        return item.postID == editPostID;
    }).pop().postAuthorId;
    // Done
    var postMessage = $('#synthesisText').val();
    // Done

    // type -- postType
    var postType = 'synthesis';

    // locationIDhidden -- postSelection
    var postSelection = ' ';
    // Not done but works.

    var postMedia = '';
    // Synthesis doesn't have media yet.

    var postContext = '';

    $('#synthesisPostWrapper > .synthesisPosts').each(function() {
        if (postContext.length > 0) {
            postContext += ',';
        }
        var thisPostID = $(this).attr('sPostID');
        postContext += thisPostID;

    });

    // Create post object and append it to allPosts

    post = {
        'postID' : editPostID,
        'postFromId' : postFromId,
        'postAuthorId' : postAuthorId,
        'postMessage' : postMessage,
        'postType' : postType,
        'postSelection' : postSelection,
        'postMediaType' : main.postMediaType,
        'postMedia' : postMedia,
        'postContext' : postContext
    };

    // run Ajax to save the post object

    $.ajax({
        type : "POST",
        url : "php/data.php",
        data : {
            post : post,
            action : 'editPost',
            currentDiscussion : currentDisc
        },
        success : function(data) {// If connection is successful .
            location.reload();
            /*
             $('#addSynthesis').slideUp('fast');   // Hide the form
             console.log('is this happening?');
             $('.levelWrapper[level="0"]').html(''); // redraw the discussion page at synthesis
             main.SingleDiscussion(currentDisc);
             main.DiscResize();
             main.VerticalHeatmap();
             */

        },
        error : function(data) {// If connection is not successful.
            console.log(data);
            console.log("Dscourse Log: the connection to data.php failed. Did not edit synthesis");
        }
    });
    main.AddLog('discussion',discID,'EditSynthesis',editPostID,' ');

};

Dscourse.prototype.ListSynthesisPosts = function(postList, sPostID, role) {// Populate unique participants.

    var main = this;

    if (!role) {
        role = 'add';
    }

    var i, o, j, k;
    var posts = postList.split(",");

    for ( i = 0; i < posts.length; i++) {
        o = posts[i];

        for ( j = 0; j < main.data.posts.length; j++) {
            k = main.data.posts[j];
            if (k.postID == o) {
                var postMessage = main.truncateText(k.postMessage, 100);
                if (role == 'add') {
                    $('.synthesisPost[sPostID="' + sPostID + '"]').append('<div sPostID="' + k.postID + '" class=" synthesisPosts" style="display:none"> <div class="synTop">' + main.getAuthorThumb(k.postAuthorId, 'tiny') + ' ' + main.getName(k.postAuthorId) + '</div><div class="synMessage">' + postMessage + ' </div><div>');
                } else if (role == 'edit') {
                    console.log('role is edit');
                    $('#synthesisPostWrapper').append('<div sPostID="' + k.postID + '" class=" synthesisPosts hide"> <div class="synTop">' + main.getAuthorThumb(k.postAuthorId, 'tiny') + ' ' + main.getName(k.postAuthorId) + '</div><div class="synMessage">' + postMessage + ' </div><button class="btn btn-mini removeSynthesisPost">Remove</button><div>');
                    $('#synthesisPostWrapper').children('div').show();
                }
            }
        }
    }
};
