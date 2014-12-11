class ApplicationController < ActionController::Base
   # Prevent CSRF attacks by raising an exception.
   # For APIs, you may want to use :null_session instead.
   protect_from_forgery with: :exception

   helper_method :current_user, :authenticate

   private

   def current_user_session
      return @current_user_session if defined?(@current_user_session)
      @current_user_session = UserSession.find
   end

   def current_user
      return @current_user if defined?(@current_user)
      @current_user = current_user_session && current_user_session.record
   end

   def authenticate
      unless current_user
         flash[:notice] = "You must be logged in to access this page"
         redirect_to new_user_session_url
         return false
      end
   end

   def not_found
      raise ActionController::RoutingError.new('Not Found')
   end

end
