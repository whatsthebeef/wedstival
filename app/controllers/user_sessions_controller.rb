class UserSessionsController < ApplicationController

   def new
      @user_session = UserSession.new
   end

   def create
      @user_session = UserSession.new(params[:user_session])
      if verify_recaptcha(model: @user_session, message: "You guessed the text wrong") && @user_session.save
         flash.now[:notice] = "Successfully logged in."
         redirect_to admin_path
      else
         flash.now[:notice] = "No no no... Try again"
         render :action => 'new'
      end
   end

   def destroy
      @user_session = UserSession.find
      @user_session.destroy
      flash.now[:notice] = "Successfully logged out."
      redirect_to root_url
   end

end
