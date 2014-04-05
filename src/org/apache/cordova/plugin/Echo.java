package org.apache.cordova.plugin;

import android.graphics.*;
import android.media.*;
import android.os.*;
import android.util.*;
import java.io.*;
import org.apache.cordova.api.*;
import org.json.*;

/**
 * This class echoes a string called from JavaScript.
 */
public class Echo extends CordovaPlugin {
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
		if (action.equals("echo")) {
			String message = args.getString(0); 
			int width = args.getInt(1);
			int height = args.getInt(2);
			this.echo(message,width,height, callbackContext);
			return true;
		}
		return false;
	}

	private void echo(String message, int width, int height, CallbackContext callbackContext) {
		if (message != null && message.length() > 0) {



			try{
				callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, getImgPaths(width,height)));
			}
			catch(JSONException e){
				callbackContext.error("ERROR!");
			}
		} else {
			callbackContext.error("Expected one non-empty string argument.");
		}
	}

	private JSONObject getImgPaths(int width, int height) throws JSONException {
		final String path = android.os.Environment.DIRECTORY_DCIM;
		File filey = new File("/mnt/sdcard/DCIM/100ANDRO");
	//	File file[] = Environment.getExternalStorageDirectory().listFiles();
		File file[] = filey.listFiles();
		JSONObject toReturn = new JSONObject();
		
		recursiveFileFind(file, toReturn,width,height);
		return toReturn;
	}

	public void recursiveFileFind(File[] file1, JSONObject toReturn, int windowWidth, int windowHeight) throws JSONException{
		int i = 0;
		String filePath="";
		if(file1!=null){
			while(i!=file1.length){
				filePath = file1[i].getAbsolutePath();
				if(file1[i].isDirectory()){
					File file[] = file1[i].listFiles();
					recursiveFileFind(file, toReturn,windowWidth,windowHeight);
				}
				else{
					if(file1[i].getName().toLowerCase().endsWith(".jpg") ||file1[i].getName().toLowerCase().endsWith(".jpeg")){
						
						BitmapFactory.Options options = new BitmapFactory.Options();
						options.inJustDecodeBounds = true;

//Returns null, sizes are in the options variable 
						//TODO: Duplicerad operation? Se getBitmapScaled
						BitmapFactory.decodeFile(filePath, options);
						int width = options.outWidth; 
						int height = options.outHeight; //If you want, the MIME type will also be decoded (if possible) String type = options.outMimeType;
						JSONObject jso = new JSONObject();
						//windowWidth = 420
						//imageWidth = 2500
						double scaleFactor = (double)windowWidth / (double)width;
						int requestHeight = (int)(Math.round(scaleFactor * (double)height));
						int requestWidth  = windowWidth;
						//int imageWidth * x = windowWidth
						int rotate = 0;
						try {
							
							rotate = getImgOrientation(file1[i]);
							Bitmap scaled = getScaledBitmap(filePath, requestHeight, requestWidth);
							jso.put("width", width);
							jso.put("height",height);
							jso.put("rotate",rotate);
							jso.put("url", encodeTobase64(scaled));
							toReturn.put(filePath, jso);
							
							
						} catch (IOException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
						//Bitmap bitMapObj= BitmapFactory.decodeFile(filePath);
						
						
					}
				}
				i++;
				//Log.d(i+"", filePath);
			}
		}
	}
	
	public int getImgOrientation(File imageFile) throws IOException{
		int rotate = 0;
        ExifInterface exif = new ExifInterface(imageFile.getAbsolutePath());
        int orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);

        switch (orientation) {
        case ExifInterface.ORIENTATION_ROTATE_270:
            rotate = 270;
            break;
        case ExifInterface.ORIENTATION_ROTATE_180:
            rotate = 180;
            break;
        case ExifInterface.ORIENTATION_ROTATE_90:
            rotate = 90;
            break;
        }
        return rotate;
	}
	
	public String encodeTobase64(Bitmap image) { 
	   Bitmap immagex=image; 
	   ByteArrayOutputStream baos = new ByteArrayOutputStream();
	   immagex.compress(Bitmap.CompressFormat.JPEG, 100, baos); 
	   byte[] b = baos.toByteArray();
	   String imageEncoded = Base64.encodeToString(b,Base64.DEFAULT);

		//	Log.e("LOOK", imageEncoded); 
	   return imageEncoded; 
	}
	public Bitmap getScaledBitmap(String pathOfInputImage, int dstHeight, int dstWidth){
		Bitmap resizedBitmap = null;
		
		try
			{
		    int inWidth = 0;
		    int inHeight = 0;
		
		    InputStream in = new FileInputStream(pathOfInputImage);
		
		    // decode image size (decode metadata only, not the whole image)
		    BitmapFactory.Options options = new BitmapFactory.Options();
		    options.inJustDecodeBounds = true;
		    BitmapFactory.decodeStream(in, null, options);
		    in.close();
		    in = null;
		
		    // save width and height
		    inWidth = options.outWidth;
		    inHeight = options.outHeight;
		
		    // decode full image pre-resized
		    in = new FileInputStream(pathOfInputImage);
		    options = new BitmapFactory.Options();
		    // calc rought re-size (this is no exact resize)
		    options.inSampleSize = Math.max(inWidth/dstWidth, inHeight/dstHeight);
		    // decode full image
		    Bitmap roughBitmap = BitmapFactory.decodeStream(in, null, options);
		
		    // calc exact destination size
		    Matrix m = new Matrix();
		    RectF inRect = new RectF(0, 0, roughBitmap.getWidth(), roughBitmap.getHeight());
		    RectF outRect = new RectF(0, 0, dstWidth, dstHeight);
		    m.setRectToRect(inRect, outRect, Matrix.ScaleToFit.CENTER);
		    float[] values = new float[9];
		    m.getValues(values);
		
		    // resize bitmap
		    resizedBitmap = Bitmap.createScaledBitmap(roughBitmap, (int) (roughBitmap.getWidth() * values[0]), (int) (roughBitmap.getHeight() * values[4]), true);
		
		    // save image
		    
		}
		catch (IOException e)
		{
    		Log.e("Image", e.getMessage(), e);
		}
		return resizedBitmap;
	}
}


	

class Img{
	private int width;
	private int height;
	private int rotate;
	
	public Img(int w, int h, int r){
		this.width=w;
		this.height=h;
		this.rotate=r;
	}
	public int getWidth(){
		return width;
	}
    public int getHeight(){
		return height;
	}
	public int getRotate(){
		return rotate;
	}
	
	
}
