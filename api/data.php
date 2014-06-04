<?php
ini_set('display_errors',1);
error_reporting(E_ALL);

include_once "config.php";


header('Content-type: application/json');

$action	=  $_POST['action'];


if ($action == 'GetData')
{
    GetData();
}
if ($action == 'AddPost')
{
    AddPost();
}
if ($action == 'DeletePost')
{
    DeletePost();
}
if ($action == 'EditPost')
{
    EditPost();
}


function GetData() {
    global $pdo;
    $postPage	= $_POST['postPage'];
    $data = [];
    // Get Users in this network or course
    $users = [
        [
            "firstName" => "Caner",
            "lastName" => "Uguz",
            "userId" => 1,
            "userPictureURL" => ""
        ],
		[
            "firstName" => "Ben",
			"lastName"	=> "Tucker",
			"userId"	=> 2,
			"userPictureURL" => ""
		],
		[
            "firstName" => "Sara",
			"lastName"	=> "Dexter",
			"userId"	=> 3,
			"userPictureURL" => ""
		]
    ];

    // Get Course Info
    $course = [
        "courseName" =>  "Sample Course",
		"courseId"	=>  $postPage  // This will be used to get the course information.
	];


    // Get Current User info
    $currentUser = [
        "firstName" =>  "Caner",
		"lastName"	=>  "Uguz",
		"userId"	=>  1,
		"userRole"=>  "Instructor",
		"userPictureURL" =>  ""
	];

    // Get Posts
    $posts = [];
    $params = array(':postPage'=>$postPage);
    $stmt = $pdo->prepare("SELECT * FROM posts WHERE postPage = :postPage");
    $stmt->execute($params);
    while($t = $stmt->fetch()){
        $posts[] = $t;
    }

    $data['users'] = $users;
    $data['course'] = $course;
    $data['currentUser'] = $currentUser;
    $data['posts'] = $posts;
    echo json_encode($data, JSON_NUMERIC_CHECK);


};


function AddPost(){
    global $pdo;

    $post = $_POST['post'];

    $postFromId		= 	$post['postFromId'];
    $postAuthorId	= 	$post['postAuthorId'];
    $postMessage	= 	$post['postMessage'];
    $postType		= 	$post['postType'];
    $postSelection	= 	$post['postSelection'];
    $postMedia		= 	$post['postMedia'];
    $postMediaType  = 	$post['postMediaType'];
    $postContext	= 	$post['postContext'];
    $postPage       =   $post['postPage'];
    $postTime       =   $post['postTime'];


    $stmt = $pdo->prepare("INSERT INTO posts (postFromId, postAuthorId, postMessage, postType, postSelection, postMedia, postMediaType, postContext, postPage, postTime) VALUES(:postFromId, :postAuthorId, :postMessage, :postType, :postSelection,:postMedia,:postMediaType ,:postContext, :postPage, :postTime)");
    $stmt->execute(array(':postFromId'=>$postFromId,':postAuthorId'=>$postAuthorId, ':postMessage'=>$postMessage, ':postType'=>$postType, ':postSelection'=>$postSelection, ':postMedia'=>$postMedia, ':postMediaType'=>$postMediaType,':postContext'=>$postContext,':postPage'=>$postPage, ':postTime'=>$postTime));

    $postID = $pdo->lastInsertId();

    $res = json_encode($postID);
    echo $res;


};

function DeletePost(){
    global $pdo;
    $id = $_POST['postId'];
    $params = array(':id'=>$id);

    $del = $pdo->prepare("DELETE FROM posts WHERE postId = :id");
    $del->execute($params);

       echo json_encode($id);
}

function EditPost(){
    global $pdo;

    $post = $_POST['post'];

    $postId         =   $post['postId'];
    $postFromId		= 	$post['postFromId'];
    $postAuthorId	= 	$post['postAuthorId'];
    $postMessage	= 	$post['postMessage'];
    $postType		= 	$post['postType'];
    $postSelection	= 	$post['postSelection'];
    $postMedia		= 	$post['postMedia'];
    $postMediaType  = 	$post['postMediaType'];
    $postContext	= 	$post['postContext'];


    $stmt = $pdo->prepare("UPDATE posts SET postFromId = :postFromId, postAuthorId = :postAuthorId, postMessage = :postMessage, postType= :postType, postSelection = :postSelection, postMedia = :postMedia, postMediaType =:postMediaType, postContext = :postContext  WHERE postID = :id");
    $stmt->execute(array(':postFromId'=>$postFromId,':postAuthorId'=>$postAuthorId, ':postMessage'=>$postMessage, ':postType'=>$postType, ':postSelection'=>$postSelection, ':postMedia'=>$postMedia, ':postMediaType'=>$postMediaType,':postContext'=>$postContext, ':id'=>$postId));


    $res = json_encode($post);
    echo $res;
}
