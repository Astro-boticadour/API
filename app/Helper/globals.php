<?php

/**
 * Send a json response with a message and a status code
 * @param string $status
 * @param string $message
 * @param int $code
 * @return \Illuminate\Http\JsonResponse
*/
function sendResponse($status,$result,$code){
    $response = [
        'status' => $status,
        'result' => $result,
    ];
    return response()->json($response, $code);
}




/**
 * Send a json response with a message and a status code
 *
*/
function sendError($message, $code = 500)
    {
       
        $response = [
            'status' => 'error',
            'message'=> $message
            ];
            return response()->json($response, $code);
    }


?>