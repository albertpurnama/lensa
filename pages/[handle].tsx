import React from 'react';
import { useRouter } from "next/router";
import Image from 'next/image';

import { ApolloClient, InMemoryCache } from '@apollo/client'

// const APIURL = 'https://api-mumbai.lens.dev/';
const APIURL = 'https://api.lens.dev';

export const apolloClient= new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache(),
})

import { gql } from '@apollo/client'


const GET_PROFILE = `
  query($request: SingleProfileQueryRequest!) {
    profile(request: $request) {
        id
        name
        bio
        attributes {
          displayType
          traitType
          key
          value
        }
        followNftAddress
        metadata
        isDefault
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        handle
        coverPicture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        ownedBy
        dispatcher {
          address
          canUseRelay
        }
        stats {
          totalFollowers
          totalFollowing
          totalPosts
          totalComments
          totalMirrors
          totalPublications
          totalCollects
        }
        followModule {
          ... on FeeFollowModuleSettings {
            type
            amount {
              asset {
                symbol
                name
                decimals
                address
              }
              value
            }
            recipient
          }
          ... on ProfileFollowModuleSettings {
            type
          }
          ... on RevertFollowModuleSettings {
            type
          }
        }
    }
  }
`;

const DEFAULT_IPFS_GATEWAY_URL = 'https://lens.infura-ipfs.io/ipfs';

export const cleanUpIpfsHash = (hash: string) => {
  // remove the leading 'ipfs://' if it exists
  if (hash.startsWith('ipfs://')) {
    return hash.substring(7);
  }
  return hash;
};

export const getProfile = (request: object) => {
   return apolloClient.query({
    query: gql(GET_PROFILE),
    variables: {
      request
    },
  })
}

type LensProfile = {
  bio: string;
  name: string;
  handle: string;
  coverPictureHash: string;
  profilePictureHash: string;
  stats: {
    totalCollects: number;
    totalComments: number;
    totalFollowers: number;
    totalFollowing: number;
    totalMirrors: number;
    totalPosts: number;
    totalPublications: number;
  }
}

import profileStyles from '../styles/Profile.module.css';

const Profile = ({profile}: {profile: LensProfile}) => {
  return <div className={profileStyles.profileContainer}>
    <div className={profileStyles.profileCover}>
      <Image 
        src={`${DEFAULT_IPFS_GATEWAY_URL}/${cleanUpIpfsHash(profile.coverPictureHash || '')}`} 
        alt="profile picture"
        layout="fill"
      />
    </div>
    <div className={profileStyles.profileImg}>
      <Image 
        src={`${DEFAULT_IPFS_GATEWAY_URL}/${cleanUpIpfsHash(profile.profilePictureHash || '')}`} 
        alt="profile picture"
        layout="fill"
      />
    </div>
    <div className={profileStyles.profileContent}>
      <div className={profileStyles.profileName}>
        {profile.name}
      </div>
      <div className={profileStyles.profileHandle}>
        @{profile.handle}
      </div>
      <br/>
      <div className={profileStyles.profileBio}>
        {profile.bio}
      </div>

      <br/>

      <div className={profileStyles.statsContainer}>
        <div className={profileStyles.stats}>
          <div className={profileStyles.statsNumber}>
            {profile.stats.totalFollowers }
          </div>
          <div>
            Followers
          </div>
        </div>
        <div className={profileStyles.stats}>
          <div className={profileStyles.statsNumber}>
            {profile.stats.totalFollowing }
          </div>
          <div>
            Following
          </div>
        </div>
      </div>
      <div className={profileStyles.profileCTAContainer}>
        <button>Follow</button>
      </div>
    </div>
  </div>
}

function ProfileHandle() {

  const router = useRouter();
  const {handle} = router.query;
  const [profile, setProfile] = React.useState<LensProfile | null>(null);

  React.useEffect(() => {
    if(!handle) return;
    getProfile({handle: handle}).then((data) => {

      const {profile} = data.data || {};

      if(!profile){
        return;
      }

      console.log({profile})
      setProfile({
        name: profile.name,
        bio: profile.bio,
        handle: profile.handle,
        coverPictureHash: profile.coverPicture?.original?.url,
        profilePictureHash: profile.picture?.original?.url,
        stats: profile.stats
      })
    })
    }, [handle]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
    }}>

      {
        profile && <div style={{
          maxWidth: 300,
        }}>
          <Profile profile={profile}/>
          </div>
      }

      {!profile && (
        <div>Profile not found!</div>
      )}
    </div>
  )
}

export default ProfileHandle;