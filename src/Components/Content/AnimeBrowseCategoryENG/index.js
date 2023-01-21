import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ENG_GENRES } from "../../../constants"
import InfiniteScroll from "react-infinite-scroll-component"
import axios from "axios"
import LoadingSpin from "react-loading-spin"
import useDocumentTitle from "../DocumentTitleHook"

const PAGE_NUMBER = 1

function AnimeBrowseCategoryENG() {
	const { genre } = useParams()

	const [animeList, setAnimeList] = useState([])
	const [genreAnime, setGenreAnime] = useState("")
	const [page, setPage] = useState(PAGE_NUMBER)
	const [loading, setLoading] = useState(true)
	const [nextPage, setNextPage] = useState(true)
	const [translateGenreAnime, setTranslateGenreAnime] = useState("")

	const scrollThreshold = () => {
		const newPage = page + 1
		setPage(newPage)
	}

	useEffect(() => {
		const CancelToken = axios.CancelToken
		const source = CancelToken.source()
		const translateGenre = () => {
			for (let i = 0; i < ENG_GENRES.length; i++) {
				if (genreAnime === ENG_GENRES[i].slug) {
					setTranslateGenreAnime(ENG_GENRES[i].name)
				}
			}
		}

		if (genre === genreAnime) {
			console.log("Run here")
			const getList = async () => {
				setTimeout(async () => {
					await axios
						.get(`https://gogoanime.consumet.org/genre/${genre}?page=${page}`, {
							cancelToken: source.token,
						})
						.then((response) => {
							if (response.data?.error?.status === 404) {
								setAnimeList((prev) => {
									return [...new Set([...prev])]
								})
								setNextPage(false)
							} else {
								setNextPage(true)
								setAnimeList((prev) => {
									return [...new Set([...prev, ...response.data])]
								})
							}

							setLoading(false)
						})
						.catch((thrown) => {
							if (axios.isCancel(thrown)) return
						})
				}, 2000)
			}

			getList()
			translateGenre()
		} else {
			setPage(1)
			setAnimeList([])
			setGenreAnime(genre)
		}

		return () => {
			clearTimeout()
			source.cancel()
		}
	}, [genreAnime, genre, page])

	return (
		<>
			<div>
				{useDocumentTitle(`Genre ${translateGenreAnime} - Unime`)}
				<h1 className="font-black">ANIME {translateGenreAnime}</h1>
			</div>
			<div className="anime-list">
				{loading ? (
					<div className="block w-100 mt-[50px] text-center">
						<LoadingSpin primaryColor="red" />
					</div>
				) : (
					<InfiniteScroll
						initialScrollY={0}
						style={{ overflow: "none" }}
						dataLength={animeList.length}
						scrollThreshold={0.95}
						next={scrollThreshold}
						hasMore={nextPage}
						loader={
							<div
								className="loading-spin"
								style={{ textAlign: "center", marginTop: "50px" }}
							>
								<LoadingSpin primaryColor="red" />
							</div>
						}
					>
						<div className="anime-container md:px-12 lg:px-20 xl:px-28 2xl:px-36 w-full pb-12 grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
							{animeList.map((item) => (
								<div
									className="group anime-item col-span-1 cursor-pointer flex flex-col items-center"
									key={item.animeId}
									title={item.animeTitle}
								>
									<div className="group-hover:opacity-70 anime-item-image relative aspect-w-2 aspect-h-3 duration-300 ease-linear w-[180px]">
										<img
											className="w-[180px] h-[240px] object-cover"
											src={item.animeImg}
											alt=""
										/>
									</div>
									<div className="anime-item-title h-[60px] w-[180px]">
										<p className="line-clamp-2">{item.animeTitle}</p>
									</div>
								</div>
							))}
						</div>
					</InfiniteScroll>
				)}
			</div>
		</>
	)
}

export default AnimeBrowseCategoryENG
