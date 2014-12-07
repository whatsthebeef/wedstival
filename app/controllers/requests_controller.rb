class RequestsController < ApplicationController
   layout "base_layout"

   def new
      @active_item = 4
      @request = Request.new 
   end

   def create
      @request = Request.new(request_params)
      if verify_recaptcha(model: @request, message: "You guessed the text wrong") && @request.save
         redirect_to new_request_path
      else 
         render "new"
      end
   end

   private 
   def request_params
      params.require(:request).permit(:artist, :song_title)
   end
end
