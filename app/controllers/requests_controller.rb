class RequestsController < ApplicationController

   def new
      @request = Request.new 
   end

   def create
      @request = Request.new(request_params)
      if verify_recaptcha(:model => @request, :message => "Oh! It's error with reCAPTCHA!") && @request.save
         redirect_to new_request_path
      else 
         render "new"
      end
   end

   def show
   end

   private 
   def request_params
      params.require(:request).permit(:artist, :song_title)
   end
end
