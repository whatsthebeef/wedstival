class Request < ActiveRecord::Base
   validates :song_title, presence: true
   validates :artist, presence: true

   def self.last_five 
      all.limit(5).order("id desc").reverse
   end
end
