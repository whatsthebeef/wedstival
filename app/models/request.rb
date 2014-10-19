class Request < ActiveRecord::Base
   validates :song_title, presence: true
   validates :artist, presence: true
end
